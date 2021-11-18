const { MongoClient } = require('mongodb');

const { derplingsPolicyId: policyId } = require('./constants');
const client = require('./blockfrost/client');
const assetGenerator = require('./blockfrost/assetGenerator');
const wait = require('./util/wait');
const runScripts = require('./db_updates/runScripts');
const transformDerplingMeta = require('./transformDerplingMeta');
const updateDerplingAttributesMaterializedView = require('./queries/updateDerplingAttributesMaterializedView');
// const transformEggMeta = require('./transformEggMeta');
// const updateEggMaterializedView = require('./queries/updateEggMaterializedView');

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

    const derplingCollection = mongoClient.db('derp').collection('derplings');
    const metaCollection = mongoClient.db('derp').collection('derplingMeta');
    const offset = await derplingCollection.countDocuments({});

    console.log('Fetching data from blockfrost...');
    const blockfrost = client({ projectId: PROJECT_ID });
    let count = 0;
    for await (const asset of assetGenerator({ blockfrost, policyId, offset })) {
      //console.log(asset);
      await derplingCollection.insertOne(asset);
      await metaCollection.insertOne(transformDerplingMeta(asset));
      count++;
      if (count % 100 === 0) {
        console.log(count);
      }
      await wait(100);
    }

    // update materialized view
    await updateDerplingAttributesMaterializedView(metaCollection);
    // const view = mongoClient.db('derp').collection('eggsWithParent');
    // const { eggId } = await view.findOne({}, { sort: { eggId: -1 } });
    // await updateEggMaterializedView(metaCollection, { eggId: { $gt: eggId } });

    console.log(`Total derpling count: ${count + offset}`);
  } catch (err) {
    console.log('Error', err);
    process.exit(1);
  } finally {
    mongoClient.close();
  }
})();
