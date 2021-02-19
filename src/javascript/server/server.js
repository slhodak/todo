const path = require('path');
const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = new (require('./database'))();

app.use(express.static('public'));
app.use('/', (req, _res, next) => {
  console.log(`Request URL: ${req.originalUrl}`);
  next();
});
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

// every day at 4am, create an empty list for today if it does not exist.
cron.schedule('* 4 * * *', async () => {
  const date = new Date();
  const todayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  if (await db.getTodoList(todayKey) == null) {
    console.log(`Today, ${todayKey}, has no list; creating one.`);
    const result = await db.createList(todayKey);
    console.log(result.result);
  }
});
