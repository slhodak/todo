// DB API

module.exports = class Database {
  constructor() {
    this.client = a;// new mongo client
    this.database = b;// mongo db
    this.collections = c;// collections
  }

  getTodoList(date) {
    // put date into correct format
    // search collection in db for todo list under that date key
    // format response
    // return
  }

  upsertTodo(date, data) {
    const { description, rank, need, want } = data;
    // find list for given date
    //    if exists, update
    //    if not exists, create list for date with given data
  }
}