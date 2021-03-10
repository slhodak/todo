const assert = require('assert');
const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const Database = require('./database');
const db = new Database();
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
    handleError(res, error);
  }
});

app.delete('/todo', async (req, res) => {
  try {
    const { description } = req.query;
    const _result = await db.deleteTodo(description);
    const list = await db.getTodoList(Database.getTodayKey());
    res.send({ list });
  } catch (error) {
    handleError(res, error);
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
    handleError(res, error);
  }
});

app.post('/list/new', async (_req, res) => {
  try {
    const yesterdaysIncompleteNeeds = await db.getDaysIncompleteNeeds(Database.getYesterdayKey());
    // Initialize a list with the incomplete "need" items of yesterday
    const _result = await db.upsertList(Database.getTodayKey(), yesterdaysIncompleteNeeds);
    const list = await db.getTodoList(Database.getTodayKey()); // excessive db call but it verifies that correct list is there
    res.send({ list });
  } catch (error) {
    handleError(res, error);
  }
});

app.delete('/list', async (req, res) => {
  try {
    const { date } = req.query;
    const _result = await db.deleteList(date); // check for error
    const list = await db.getTodoList(Database.getTodayKey());
    res.send({ list });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/list/restore', async (req, res) => {
  try {
    const { date } = req.query;
    const list = await db.restoreList(date);
    res.send({ list });
  } catch (error) {
    handleError(res, error);
  }
});

// Entropy Opposition

app.get('/entropy', async (_req, res) => {
  try {
    let result = await db.getEntropyTasks(Database.getTodayKey());
    if (result === null) {
      await db.initEntropyTasks(Database.getTodayKey());
      result = await db.getEntropyTasks(Database.getTodayKey());
    }
    const { meditate1, meditate2, exercise } = result;
    res.send({ meditate1, meditate2, exercise });
  } catch(error) {
      handleError(res, error);
  }
});

app.post('/entropy', async (req, res) => {
  try {
    const { type, change } = req.query;
    const _result = await db.updateEntropyTask(type, parseBool(change));
    const { meditate1, meditate2, exercise } = await db.getEntropyTasks(Database.getTodayKey());
    res.status(200).send({ meditate1, meditate2, exercise });
  } catch (error) {
    handleError(res, error);
  }
});

// Stats Fetching

app.get('/stats/week', async (_req, res) => {
  try {
    console.debug('Getting week\'s stats');
    // Memoize this in 'aggregates' db collection
    const stats = await db.getPreviousWeekStats();
    res.send({ stats });
  } catch (error) {
    handleError(res, error);
  }
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
  } catch (error) {
    handleError(res, error)
  }
});

app.get('/blockchain/listHash', async(req, res) => {
  try {
    const { date } = req.query;
    assert(Database.dateKeyRegex.test(date));
    let data = await todoContract.listHashes(fromAddress, date);
    res.send({ hash: data });
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/blockchain/saveListHash', async (_req, res) => {
  try {
    if (fromAddress.length === 0) {
      res.status(400).send('No address to save from; please log in.');
      return;
    }
    const todayKey = Database.getTodayKey(); // "2021-2-1"
    const list = await db.getTodoList(todayKey);
    console.log('saving ', JSON.stringify(list));
    todoContract.saveListHash(fromAddress, list, todayKey);
    res.sendStatus(200);
  } catch (error) {
    handleError(res, error);
  }
});

// General

app.listen(3000, () => {
  console.log('App listening on port 3000');
});

// every day at 4am, create an empty list for today if it does not exist.
cron.schedule('* 4 * * *', async () => {
  const todayKey = Database.getTodayKey();
  const todayList = await db.getTodoList(todayKey);
  if (todayList === null) {
    const yesterdayList = await db.getTodoList(Database.getYesterdayKey());
    todoContract.saveListHash(fromAddress, yesterdayList, todayKey);
    console.log(`Today, ${todayKey}, has no list; creating one.`);
    const result = await db.upsertList(getTodayKey, []);
    console.log(result.result);
  }
});

// Utils

function parseBool(string) {
  if (typeof string != 'string') {
    throw new Error(`Parameter given was not a string; it was a ${typeof string}`);
  }
  const lowercase = string.toLowerCase();
  if (lowercase === 'true') {
    return true;
  } else if (lowercase === 'false') {
    return false;
  }
  throw new Error(`String was neither "true" nor "false"; it was "${lowercase}"`);
}

function handleError(res, error) {
  console.error(error);
  res.status(500).send({ error: error.message });
}
