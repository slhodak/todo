const path = require('path');
const express = require('express');
const app = express();
const db = new require('./database')();

app.use('/', express.static(path.resolve('../../', 'public')));

app.get('/all', (req, res) => {
  const collection = db.client['myCollection'];
  const viewAll = collection.find({});
  res.send(viewAll);
});

app.get('/list', (req, res) => {
  const day = req.params['date'];
  const todoList = db.getTodoList(day);
  res.send(todoList);
});

app.post('/todo', (req, res) => {
  const { description, rank, need, want } = req.params;
  db.upsertTodo(new Date('today'), {
    description, rank, need, want
  });
  res.send(200);
})

app.listen(3000, () => {
  console.log('App listening on port 3000');
});
