const { MongoClient } = require('mongodb');

const { rockerPolicyId: policyId } = require('./constants');
const client = require('./blockfrost/client');
const assetGenerator = require('./blockfrost/assetGenerator');
const wait = require('./util/wait');
const runScripts = require('./db_updates/runScripts');
const transformRockerMeta = require('./transformRockerMeta');
const updateRockerTraitsMaterializedView = require('./queries/updateRockerTraitsMaterializedView');
const updateRockerRarities = require('./queries/updateRockerRarities');
const updateRockerStatsMaterializedView = require('./queries/updateRockerStatsMaterializedView');
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
    const rockerCollection = db.collection('babyRockers');
    const metaCollection = db.collection('babyRockerMeta');
    const offset = await rockerCollection.countDocuments({});

    console.log('Fetching data from blockfrost...');
    const blockfrost = client({ projectId: PROJECT_ID });
    let count = 0;
    for await (const asset of assetGenerator({ blockfrost, policyId, offset })) {
      //console.log(asset);
      await rockerCollection.updateOne(
        { 'onchain_metadata.name': asset.onchain_metadata.name },
        { $set: asset }, 
        { upsert: true }
      );
      await metaCollection.updateOne(
        { name: asset.onchain_metadata.name },
        { $set: transformRockerMeta(asset) }, 
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
    await updateRockerTraitsMaterializedView(metaCollection);
    await updateRockerRarities(rockerCollection);
    await updateRockerStatsMaterializedView(metaCollection);

    console.log(`Total baby rocker count: ${count + offset}`);
  } catch (err) {
    console.log('Error', err);
    process.exit(1);
  } finally {
    mongoClient.close();
  }
})();
