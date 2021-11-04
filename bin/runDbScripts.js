const { MongoClient } = require('mongodb');
const runScripts = require('../src/db_updates/runScripts');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';    

(async () => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();
    console.log('Connected to database');
    await runScripts(mongoClient);
  } catch (err) {
    console.log('Error!', err);
    process.exit(1);
  } finally {
    mongoClient.close();
  }
})();