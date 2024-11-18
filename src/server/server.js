const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
const env = require('dotenv').config({path: __dirname + '/.env'}).parsed;
const app = express();
const Database = require('./database');
const db = new Database();

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

async function createNewList() {
  const yesterdaysIncomplete = await db.getDaysIncompleteAll(Database.getYesterdayKey());
  // Initialize a list with all the incomplete items of yesterday
  await db.upsertList(Database.getTodayKey(), yesterdaysIncomplete);
  return await db.getTodoList(Database.getTodayKey()); // excessive db call but it verifies that correct list is there
};

app.post('/list/new', async (_req, res) => {
  try {
    const list = await createNewList();
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

// General

app.listen(env.NODE_PORT, () => {
  console.log(`App listening on port ${env.NODE_PORT}`);
});

// every day at 4am, create a list for today if none exists
// include all the incomplete items from yesterday
cron.schedule('0 4 * * *', async () => {
  try {
    const todayKey = Database.getTodayKey();
    const todayList = await db.getTodoList(todayKey);
    if (todayList === null) {
      await createNewList()
    }
  } catch (error) {
    console.error('Error in cron job:', error);
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
