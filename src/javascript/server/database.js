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
    const { todos } = list;
    const itemIndex = todos.findIndex(todo => todo.description === newTodo.description);
    if (itemIndex >= 0) {
      todos[itemIndex] = newTodo;
    } else {
      todos.push(newTodo);
    }
    const filter = { date: dateKey };
    const upsert = { $set: { todos } };
    const options = { upsert: true };
    let _result = await this.query(async collection => await collection.updateOne(filter, upsert, options));  // check result
    return { date: dateKey, todos: todos };
  }

  async deleteTodos() {
    const dateKey = this.getTodayKey();
    const filter = { date: dateKey };
    const upsert = { $set: { todos: [] } };
    const options = { upsert: true };
    let _result = await this.query(async collection => await collection.updateOne(filter, upsert, options)); // check result
    return { date: dateKey, todos: [] };
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

  async upsertList(dateKey) {
    assert(dateKey.match(dateKeyRegex));
    const filter = { date: dateKey };
    const upsert = { $set: { todos: [] } };
    const options = { upsert: true };
    return await this.query(async collection => await collection.updateOne(filter, upsert, options));
  }

  async deleteList(dateKey) {
    assert(dateKey.match(dateKeyRegex));
    return await this.query(async collection => await collection.deleteOne({ date: { $eq: dateKey } }));
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

  getTodayKey() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  validateTodo(todo) {
    assert.strictEqual(typeof todo.description, 'string');
    assert.strictEqual(typeof todo.rank, 'number');
    assert.strictEqual(typeof todo.need, 'boolean');
    assert.strictEqual(typeof todo.want, 'boolean');
  }
}
