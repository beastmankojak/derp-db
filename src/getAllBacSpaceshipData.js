const { MongoClient } = require('mongodb');

const { bacSpaceshipPolicyId: policyId } = require('./constants');
const client = require('./blockfrost/client');
const assetGenerator = require('./blockfrost/assetGenerator');
const wait = require('./util/wait');
const runScripts = require('./db_updates/runScripts');
const transformSpaceshipMeta = require('./transformSpaceshipMeta');
const updateSpaceshipTraitsMaterializedView = require('./queries/updateSpaceshipTraitsMaterializedView');
const updateSpaceshipRarities = require('./queries/updateSpaceshipRarities');
const updateSpaceshipStatsMaterializedView = require('./queries/updateSpaceshipStatsMaterializedView');
// const updateTwins = require('./queries/updateTwins');

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

    const db = mongoClient.db('bac');
    const spaceshipCollection = db.collection('bacSpaceships');
    const metaCollection = db.collection('bacSpaceshipMeta');
    const offset = await spaceshipCollection.countDocuments({});

    console.log('Fetching data from blockfrost...');
    const blockfrost = client({ projectId: PROJECT_ID });
    let count = 0;
    for await (const asset of assetGenerator({ blockfrost, policyId, offset })) {
      //console.log(asset);
      await spaceshipCollection.updateOne(
        { 'onchain_metadata.name': asset.onchain_metadata.name },
        { $set: asset }, 
        { upsert: true }
      );
      await metaCollection.updateOne(
        { name: asset.onchain_metadata.name },
        { $set: transformSpaceshipMeta(asset) }, 
        { upsert: true }
      );
      count++;
      if (count % 100 === 0) {
        console.log(count);
      }
      await wait(100);
    }

    console.log('updating views...');
    // update materialized views
    // await updateTwins(metaCollection);
    await updateSpaceshipTraitsMaterializedView(metaCollection);
    await updateSpaceshipRarities(spaceshipCollection);
    await updateSpaceshipStatsMaterializedView(metaCollection);

    console.log(`Total spaceship count: ${count + offset}`);
  } catch (err) {
    console.log('Error', err);
    process.exit(1);
  } finally {
    mongoClient.close();
  }
})();
