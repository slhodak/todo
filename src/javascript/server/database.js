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
      console.log(`Connected to db '${db.databaseName}'`);
      const collection = db.collection(this.collectionName);
      const result = await method(collection);
      await client.close();
      return result;
    } catch (error) {
      console.error(error);
      client.close();
    }
  }

  async getAll() {
    return await this.query(async collection => await collection.find({}).toArray());
  }

  async getTodoList(dateKey) {
    assert(dateKey.match(dateKeyRegex));
    console.log(`Getting list for ${dateKey}`);
    return await this.query(async collection => await collection.findOne({ date: { $eq: dateKey } }));
  }

  async upsertTodo(todo) {
    const dateKey = this.getTodayKey();
    const list = await this.getTodoList(dateKey);
    console.log(list);
    const todos = list ? list.todos.concat(todo) : [ todo ];
    const filter = { date: dateKey };
    const update = { $set: { date: dateKey, todos: todos } };
    const options = { upsert: true };
    return await this.query(async collection => await collection.updateOne(filter, update, options));
  }

  async createList(dateKey) {
    assert(dateKey.match(dateKeyRegex));
    const list = { date: dateKey, todos: [] };
    return await this.query(async collection => await collection.insertOne(list));
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
