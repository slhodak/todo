const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://127.0.0.1:27017';
const dateKeyRegex = /\d{4}-\d+-\d+/; // YYYY-[M]M-[D]D
const millisInADay = 1000 * 60 * 60 * 24;

module.exports = class Database {
  constructor() {
    this.dbName = 'todo';
    this.listsCollection = 'lists';
    this.statsCollection = 'stats';
  }

  // Complex hybrid async/callback design just so queriers don't need to close client?
  async query(collectionName, method) {
    let client;
    try {
      client = await MongoClient.connect(url, { useUnifiedTopology: true });
      assert.notStrictEqual(null, client);
      const db = client.db(this.dbName);
      console.log(`Connected to db '${db.databaseName}' for method '${method}'`);
      const collection = db.collection(collectionName);
      const result = await method(collection);
      await client.close();
      return result;
    } catch (error) {
      console.error(error);
      client.close();
    }
  }

  // Todo Item Operations

  async upsertTodo(newTodo) {
    console.log('Upserting todo', newTodo);
    const dateKey = this.getTodayKey();
    const list = await this.getTodoList(dateKey);
    const { todos } = list;
    this._upsertTodoMaintainingOrder(todos, newTodo);
    const filter = { date: dateKey };
    const upsert = { $set: { todos } };
    const options = { upsert: true };
    let _result = await this.query(this.listsCollection, async collection => await collection.updateOne(filter, upsert, options));  // check result
    return { date: dateKey, todos: todos };
  }

  // Upserts the todo while keeping the list ordered
  _upsertTodoMaintainingOrder(todos, newTodo) {
    if (todos.length === 0) { // no elements in array
      todos.push(newTodo);
      return;
    }
    const itemIndex = todos.findIndex(todo => todo.description === newTodo.description);
    console.log(`Index where "${newTodo.description}" was found`, itemIndex);
    const validRange = this._findValidUpsertRange(todos, newTodo);
    console.log(`Indexes to insert "${newTodo.description}" within, by rating`, validRange);
    if (itemIndex >= 0 && itemIndex >= validRange[0] && itemIndex <= validRange[1]) { // item exists in array within valid range
      todos[itemIndex] = newTodo;
    } else if (itemIndex >= 0) { // item is in the array outside valid range
      todos.splice(itemIndex, 1);
      todos.splice(validRange[1], 0, newTodo);
    } else { // item is not in the array
      todos.splice(validRange[1], 0, newTodo);
    }
  }

  _findValidUpsertRange(todos, newTodo) {
    let validRange = [null, todos.length];
    // range begins
    //   before the first item with a lower or equal rating, or the first index
    // range ends
    //   before the first item with lower rating, or the last index
    for (let i = 0; i < todos.length; i++) {
      if (validRange[0] === null && todos[i].rating <= newTodo.rating) {
        validRange[0] = i - 1 > 0 ? i - 1 : 0;
      }
      if (todos[i].rating < newTodo.rating) {
        validRange[1] = i;
        break;
      }
    }
    if (validRange[0] === null) {
      validRange[0] = 0;
    }
    return validRange;
  }

  async deleteTodo(description) {
    const dateKey = this.getTodayKey();
    const list = await this.getTodoList(dateKey);
    if (!list) { return "Error: no list found for today" }

    const todos = list.todos.filter(todo => todo.description != description);
    const filter = { date: dateKey };
    const update = { $set: { date: dateKey, todos: todos } };
    return await this.query(this.listsCollection, async collection => await collection.updateOne(filter, update));
  }

  // List Operations

  async getAll() {
    return await this.query(this.listsCollection, async collection => await collection.find({}).toArray());
  }

  async getTodoList(dateKey) {
    assert(dateKey.match(dateKeyRegex));
    console.log(`Getting list for ${dateKey}`);
    return await this.query(this.listsCollection, async collection => await collection.findOne({ date: { $eq: dateKey } }));
  }

  async upsertList(dateKey, todos) {
    assert(dateKey.match(dateKeyRegex));
    const filter = { date: dateKey };
    const upsert = { $set: { todos } };
    const options = { upsert: true };
    return await this.query(this.listsCollection, async collection => await collection.updateOne(filter, upsert, options));
  }

  async deleteList(dateKey) {
    assert(dateKey.match(dateKeyRegex));
    return await this.query(this.listsCollection, async collection => await collection.deleteOne({ date: { $eq: dateKey } }));
  }

  // Statistics Operations

  // Run once a week
  async generatePreviousWeekStats() {
    // sum completed and total tasks of all days in week
    const now = Date.now();
    // from 8 days ago to 1 day ago; last week ended yesterday (Sunday), today is Monday
    let weeksDays = [];
    for (let i = 7; i > 0; i--) {
      weeksDays.push(this.getDayKey(now - (millisInADay * i)));
    }
    console.log(weeksDays);
    // get lists for every day in the week
    let lists = [];
    for (let i = 0; i < weeksDays.length; i++ ) {
      lists.push(await this.getTodoList(weeksDays[i]));
    }
    let summary = {
      type: "week",
      startDate: weeksDays[0],
      endDate: weeksDays[6],
      need: {
        completed: 0,
        total: 0
      },
      needWant: {
        completed: 0,
        total: 0
      },
      want: {
        completed: 0,
        total: 0
      },
      neither: {
        completed: 0,
        total: 0
      }
    };
    // ratings go from -2 to 1, but here go from 0 to 3
    let zeroIndexedRatings = ['neither', 'want', 'needWant', 'need'];
    // count all tasks completed and totals
    for (let i = 0; i < lists.length; i++) {
      if (!lists[i]) {
        continue;
      }
      let { todos } = lists[i];
      for (let i = 0; i < todos.length; i++) {
        let type = zeroIndexedRatings[todos[i].rating + 2];
        summary[type].total += 1;
        if (todos[i].complete === true) {
          summary[type].completed += 1; 
        }
      }
    }
    return summary; // write to db
  }

  // Run once a month
  async generatePreviousMonthStats() {
    // sum completed and total tasks of all days in month
  }

  // Run once a year
  async generatePreviousYearStats() {
    // sum stats of all months of year
  }

  // Utils

  getDayKey(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  getTodayKey() {
    return this.getDayKey(Date.now());
  }
  getYesterdayKey() {
    return this.getDayKey(Date.now() - millisInADay);
  }

  validateTodo(todo) {
    assert.strictEqual(typeof todo.description, 'string');
    assert.strictEqual(typeof todo.rank, 'number');
    assert.strictEqual(typeof todo.need, 'boolean');
    assert.strictEqual(typeof todo.want, 'boolean');
  }
}
