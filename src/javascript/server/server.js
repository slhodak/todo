const path = require('path');
const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = new (require('./database'))();
const todoContract = new (require('./blockchain'))();
let fromAddress = '';

app.use(express.static('public'));
app.use('/', (req, _res, next) => {
  console.log(`Request URL: ${req.originalUrl} | method: ${req.method}`);
  next();
});
app.use('/', bodyParser.json());

// Todo Item Operations

app.post('/todo', async (req, res) => {
  try {
    const todo = req.body; // opaque
    const list = await db.upsertTodo(todo);
    res.send({ list });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

app.delete('/todo', async (req, res) => {
  try {
    const { description } = req.query;
    const _result = await db.deleteTodo(description);
    const list = await db.getTodoList(db.getTodayKey());
    res.send({ list });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// List Operations

app.get('/all', async (_req, res) => {
  const allLists = await db.getAll();  
  res.send({ lists: allLists });
});

app.get('/list', async (req, res) => {
  try {
    const { date } = req.query;
    const list = await db.getTodoList(date);
    res.send({ list });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

app.post('/list', async (req, res) => {
  try {
    const todos = req.body;
    const _result = await db.upsertList(db.getTodayKey(), todos);
    const list = await db.getTodoList(db.getTodayKey());
    res.send({ list });
  } catch (err) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

app.delete('/list', async (req, res) => {
  try {
    const { date } = req.query;
    const _result = await db.deleteList(date); // check for error
    const list = await db.getTodoList(db.getTodayKey());
    res.send({ list });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

app.get('/list/restore', async (req, res) => {
  try {
    const { date } = req.query;
    const list = await db.restoreList(date);
    res.send({ list });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Stats Fetching
app.get('/stats', (req, res) => {
  
  // list.todos.map(todo => <div></div>)}
});

// Blockchain Operations

app.post('/blockchain/login', (req, res) => {
  try {
    const { address } = req.query;
    if (address.length != 42 || address.substr(0, 2) != '0x') {
      res.status(400).send({ error: `Received invalid address ${address}` });
      return;
    }
    fromAddress = address;
    res.send({ address: fromAddress });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post('/blockchain/saveListHash', async (_req, res) => {
  try {
    if (fromAddress.length === 0) {
      res.status(400).send('No address to save from; please log in.');
      return;
    }
    const todayKey = db.getTodayKey(); // "2021-2-1"
    const list = await db.getTodoList(todayKey);
    console.log('saving ', JSON.stringify(list));
    todoContract.saveListHash(fromAddress, list, todayKey);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// General

app.listen(3000, () => {
  console.log('App listening on port 3000');
});

// every day at 4am, create an empty list for today if it does not exist.
cron.schedule('* 4 * * *', async () => {
  const todayKey = db.getTodayKey();
  const todayList = await db.getTodoList(todayKey);
  if (todayList == null) {
    const yesterdaylist = await db.getTodoList(db.getYesterdayKey());
    todoContract.saveListHash(fromAddress, yesterdayList, todayKey);
    console.log(`Today, ${todayKey}, has no list; creating one.`);
    const result = await db.upsertList(getTodayKey, []);
    console.log(result.result);
  }
});
