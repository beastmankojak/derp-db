const { MongoClient } = require('mongodb');

const { derpEggsPolicyId: policyId } = require('./constants');
const client = require('./blockfrost/client');
const assetGenerator = require('./blockfrost/assetGenerator');
const wait = require('./util/wait');
const runScripts = require('./db_updates/runScripts');
const transformEggMeta = require('./transformEggMeta');

const PROJECT_ID = process.env.PROJECT_ID;
if (!PROJECT_ID) {
  console.log('Hey, you need to set the PROJECT_ID env var before running this script!');
  process.exit(1);
}

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';    
(async () => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();
    console.log('Connected to database');
    await runScripts(mongoClient);

    const eggCollection = mongoClient.db('derp').collection('eggs');
    const metaCollection = mongoClient.db('derp').collection('eggMeta');
    const offset = await eggCollection.countDocuments({});

    console.log('Fetching data from blockfrost...');
    const blockfrost = client({ projectId: PROJECT_ID });
    let count = 0;
    for await (const asset of assetGenerator({ blockfrost, policyId, offset })) {
      //console.log(asset);
      await eggCollection.insertOne(asset);
      await metaCollection.insertOne(transformEggMeta(asset));
      count++;
      if (count % 100 === 0) {
        console.log(count);
      }
      await wait(100);
    }
    console.log(`Total egg count: ${count + offset}`);
  } catch (err) {
    console.log('Error', err);
    process.exit(1);
  } finally {
    mongoClient.close();
  }
})();
