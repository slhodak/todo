const path = require('path');
const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = new (require('./database'))();

app.use(express.static('public'));
app.use('/', (req, _res, next) => {
  console.log(`Request URL: ${req.originalUrl} | method: ${req.method}`);
  next();
});
app.use('/', bodyParser.json());

// Todo Item Operations

app.post('/todo', async (req, res) => {
  try {
    const data = req.body; // opaque
    console.debug('Upserting todo', data.description);
    const list = await db.upsertTodo(data);
    res.send(list);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete('/todo', async (req, res) => {
  try {
    const { description } = req.query;
    const list = await db.deleteTodo(description);
    res.send(list);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete('/todos', async (_req, res) => {
  try {
    const list = await db.deleteTodos(); // check for error
    res.send(list);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
})

// List Operations

app.get('/all', async (_req, res) => {
  const allLists = await db.getAll();  
  res.send(allLists);
});

app.get('/list', async (req, res) => {
  try {
    const { date } = req.query;
    const list = await db.getTodoList(date);
    if (list) {
      res.send(list);
    } else {
      res.send([]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post('/list', async (_req, res) => {
  try {
    const result = await db.upsertList(db.getTodayKey());
    res.send(result);
  } catch (err) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete('/list', async (req, res) => {
  try {
    const { date } = req.query;
    const _result = await db.deleteList(date); // check for error
    const list = await db.getTodoList(db.getTodayKey());
    res.send(list);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// General

app.listen(3000, () => {
  console.log('App listening on port 3000');
});

// every day at 4am, create an empty list for today if it does not exist.
cron.schedule('* 4 * * *', async () => {
  const date = new Date();
  const todayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  if (await db.getTodoList(todayKey) == null) {
    console.log(`Today, ${todayKey}, has no list; creating one.`);
    const result = await db.upsertOne(todayKey);
    console.log(result.result);
  }
});
