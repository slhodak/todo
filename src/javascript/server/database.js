const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://127.0.0.1:27017';
const dateKeyRegex = /\d{4}-\d+-\d+/; // YYYY-[M]M-[D]D

module.exports = class Database {
  constructor() {
    this.dbName = 'todo';
    this.collectionName = 'todo';
  }

  // Complex hybrid async/callback design just so queriers don't need to close client?
  async query(method) {
    let client;
    try {
      client = await MongoClient.connect(url, { useUnifiedTopology: true });
      assert.notStrictEqual(null, client);
      const db = client.db(this.dbName);
      console.log(`Connected to db '${db.databaseName}' for method '${method}'`);
      const collection = db.collection(this.collectionName);
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
    const dateKey = this.getTodayKey();
    const list = await this.getTodoList(dateKey);
    const { todos } = list
    this._upsertTodoMaintainingOrder(todos, newTodo);
    const filter = { date: dateKey };
    const upsert = { $set: { todos } };
    const options = { upsert: true };
    let _result = await this.query(async collection => await collection.updateOne(filter, upsert, options));  // check result
    return { date: dateKey, todos: todos };
  }

  // Upserts the todo while keeping the list ordered
  _upsertTodoMaintainingOrder(todos, newTodo) {
    const itemIndex = todos.findIndex(todo => todo.description === newTodo.description);
    console.log('Index where todo was found', itemIndex);
    const indexByRating = todos.findIndex(todo => todo.rating < newTodo.rating);
    console.log('Index to insert at by rating', indexByRating);
    if (indexByRating < 0) { // no elements in array
      todos.push(newTodo);
    } else if (itemIndex >= 0 && itemIndex === indexByRating) { // item exists in array at same target spot
      todos[itemIndex] = newTodo;
    } else if (itemIndex >= 0) { // item is in the array at a different spot
      todos.splice(itemIndex, 1);
      todos.splice(indexByRating, 0, newTodo);
    } else { // item is not in the array
      todos.splice(indexByRating, 0, newTodo);
    }
  }

  async deleteTodo(description) {
    const dateKey = this.getTodayKey();
    const list = await this.getTodoList(dateKey);
    if (!list) { return "Error: no list found for today" }

    const todos = list.todos.filter(todo => todo.description != description);
    const filter = { date: dateKey };
    const update = { $set: { date: dateKey, todos: todos } };
    return await this.query(async collection => await collection.updateOne(filter, update));
  }

  // List Operations

  async getAll() {
    return await this.query(async collection => await collection.find({}).toArray());
  }

  async getTodoList(dateKey) {
    assert(dateKey.match(dateKeyRegex));
    console.log(`Getting list for ${dateKey}`);
    return await this.query(async collection => await collection.findOne({ date: { $eq: dateKey } }));
  }

  async upsertList(dateKey, todos) {
    assert(dateKey.match(dateKeyRegex));
    const filter = { date: dateKey };
    const upsert = { $set: { todos } };
    const options = { upsert: true };
    return await this.query(async collection => await collection.updateOne(filter, upsert, options));
  }

  async deleteList(dateKey) {
    assert(dateKey.match(dateKeyRegex));
    return await this.query(async collection => await collection.deleteOne({ date: { $eq: dateKey } }));
  }

  getTodayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  getYesterdayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate() - 1}`;
  }

  validateTodo(todo) {
    assert.strictEqual(typeof todo.description, 'string');
    assert.strictEqual(typeof todo.rank, 'number');
    assert.strictEqual(typeof todo.need, 'boolean');
    assert.strictEqual(typeof todo.want, 'boolean');
  }
}
