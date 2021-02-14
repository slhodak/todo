const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = new (require('./database'))();

app.use('/', express.static(path.resolve('../../', 'public')));
app.use('/', bodyParser.json());

app.get('/all', async (_req, res) => {
  const allLists = await db.getAll();  
  res.send(allLists);
});

app.get('/list', async (req, res) => {
  try {
    const { date } = req.query;
    const list = await db.getTodoList(date);
    res.send(list);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post('/todo', async (req, res) => {
  try {
    const data = req.body; // opaque
    const result = await db.upsertTodo(data);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete('/list', async (req, res) => {
  try {
    const { date } = req.query;
    const result = await db.deleteList(date);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete('/todo', async (req, res) => {
  try {
    const { description } = req.query;
    const result = await db.deleteTodo(description);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(3000, () => {
  console.log('App listening on port 3000');
});
