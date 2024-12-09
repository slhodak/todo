const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://127.0.0.1:27017';
const millisInADay = 1000 * 60 * 60 * 24;

module.exports = class Database {
  static dateKeyRegex = /\d{4}-\d+-\d+/; // YYYY-[M]M-[D]D

  constructor() {
    this.dbName = 'todo';
    this.listsCollection = 'lists';
    this.statsCollection = 'stats';
    this.opposeEntropyCollection = 'opposeEntropy';
  }

  // Complex hybrid async/callback design just so queriers don't need to close client?
  async query(collectionName, method) {
    let client;
    try {
      client = await MongoClient.connect(url);
      assert.notStrictEqual(null, client);
      const db = client.db(this.dbName);
      // console.log(`Connected to db '${db.databaseName}' for method '${method}'`);
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
    const dateKey = Database.getTodayKey();
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
    // range begins before the first item with a lower or equal rating, or the first index
    // range ends before the first item with lower rating, or the last index
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
    const dateKey = Database.getTodayKey();
    const list = await this.getTodoList(dateKey);
    if (!list) { return "Error: no list found for today" }
    const _result = await this.backupList(dateKey);

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
    assert(Database.dateKeyRegex.test(dateKey));
    console.log(`Getting list for ${dateKey}`);
    return await this.query(this.listsCollection, async collection => await collection.findOne({ date: { $eq: dateKey } }));
  }

  async getDaysIncompleteAll(dateKey) {
    assert(Database.dateKeyRegex.test(dateKey));
    const list = await this.getTodoList(Database.getYesterdayKey());
    if (!list) { // if a whole day passes without a list, ?
      return [];
    }
    const { todos } = list;
    return todos.filter(todo => !todo.complete);
  }

  async upsertList(dateKey, todos) {
    assert(Database.dateKeyRegex.test(dateKey));
    // Backup every time, a new list might not be empty because it would include incomplete "need" items
    const _result = await this.backupList(dateKey);
    const filter = { date: dateKey };
    const upsert = { $set: { todos } };
    const options = { upsert: true };
    return await this.query(this.listsCollection, async collection => await collection.updateOne(filter, upsert, options));
  }

  async deleteList(dateKey) {
    assert(Database.dateKeyRegex.test(dateKey));
    const _result = await this.backupList(dateKey);
    return await this.query(this.listsCollection, async collection => await collection.deleteOne({ date: { $eq: dateKey } }));
  }

  // Call before any delete operation
  async backupList(dateKey) {
    assert(Database.dateKeyRegex.test(dateKey));
    let todos = [];  // New day, null list
    const list = await this.getTodoList(dateKey);
    if (list) {
     todos = list.todos;
    }
    const filter = { date: `${dateKey}-backup` };
    const upsert = { $set: { todos } };
    const options = { upsert: true };
    return await this.query(this.listsCollection, async collection => await collection.updateOne(filter, upsert, options));
  }

  async restoreList(dateKey) {
    assert(Database.dateKeyRegex.test(dateKey));
    const list = await this.getTodoList(`${dateKey}-backup`);
    if (!list) {
      throw new Error(`No backup found for date ${dateKey}`);
    }
    const { todos } = list;
    const _result = await this.upsertList(dateKey, todos);
    return list;
  }

  // OpposeEntropy Operations

  async initEntropyTasks(dateKey) {
    assert(Database.dateKeyRegex.test(dateKey));
    console.debug('Initializing entropy tasks');
    const document = { date: dateKey, meditate1: false, meditate2: false, exercise: false };
    return await this.query(this.opposeEntropyCollection, async collection => await collection.insertOne(document));
  }

  async getEntropyTasks(dateKey) {
    assert(Database.dateKeyRegex.test(dateKey));
    console.debug('Getting entropy tasks for', dateKey);
    return await this.query(this.opposeEntropyCollection, async collection => await collection.findOne({ date: { $eq: dateKey } }));
  }

  // Set the bit (true/false) of one of the entropy-opposition tasks
  async updateEntropyTask(type, bit) {
    const date = Database.getTodayKey();
    const filter = { date };
    const update = { $set: { [type]: bit } };
    const options = { upsert: true };
    return await this.query(this.opposeEntropyCollection, async collection => await collection.updateOne(filter, update, options));
  }

  // Statistics Operations

  // Todo: Memoize this
  async getPreviousWeekStats() {
    const now = Date.now();
    const days = [];
    // from 7 days ago to 1 day ago, inclusive
    for (let i = 7; i > 0; i--) {
      days.push(Database.getKeyNDaysBefore(now, i));
    }
    console.debug('Getting stats for days', days);
    // memoize these
    let entropyStats = await this.generateEntropyStatsFor(days);
    let todoStats = await this.generateTodoStatsFor(days);
    return {
      type: "week",
      startDate: days[0],
      endDate: days[6],
      entropyStats: entropyStats,
      todoStats: todoStats
    };
  }

  async generateEntropyStatsFor(days) {
    let tasks = [];
    for (let i = 0; i < days.length; i++) {
      tasks.push(await this.getEntropyTasks(days[i]));
    }
    // Only expect 5 days of exercise and meditation per week
    const entropyStats = Database.blankEntropyStatsFor(5);
    // add up all the meditate1, meditate2, and exercises in the days found
    for (let i = 0; i < tasks.length; i++) {
      if (!tasks[i]) {
        continue;
      }
      entropyStats.meditate.completed += tasks[i].meditate1 ? 1 : 0;
      entropyStats.meditate.completed += tasks[i].meditate2 ? 1 : 0;
      entropyStats.exercise.completed += tasks[i].exercise ? 1 : 0;
    }
    return entropyStats;
  }

  async generateTodoStatsFor(days) {
    // sum completed and total tasks of all days in week
    let lists = [];
    for (let i = 0; i < days.length; i++) {
      lists.push(await this.getTodoList(days[i]));
    }
    const todoStats = Database.blankTodoStats();
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
        todoStats[type].total += 1;
        if (todos[i].complete === true) {
          todoStats[type].completed += 1; 
        }
      }
    }
    return todoStats;
  }

  // Utils

  static getDayKey(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  static getTodayKey() {
    return Database.getDayKey(Date.now());
  }
  static getYesterdayKey() {
    return Database.getDayKey(Date.now() - millisInADay);
  }
  static getKeyNDaysBefore(now, n) {
    return Database.getDayKey(now - (millisInADay * n));
  }

  static blankTodoStats() {
    return {
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
    }
  };

  static blankEntropyStatsFor(days) {
    return {
      meditate: {
        completed: 0,
        total: days * 2
      },
      exercise: {
        completed: 0,
        total: days
      }
    }
  };

  validateTodo(todo) {
    assert.strictEqual(typeof todo.description, 'string');
    assert.strictEqual(typeof todo.rank, 'number');
    assert.strictEqual(typeof todo.need, 'boolean');
    assert.strictEqual(typeof todo.want, 'boolean');
  }
}
