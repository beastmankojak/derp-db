const { MongoClient } = require('mongodb');

const client = require('./blockfrost/client');
const assetGenerator = require('./blockfrost/assetGenerator');
const wait = require('./util/wait');
const ensureUniqueNameIndex = require('./queries/ensureUniqueNameIndex');

const buildLoader = ({
  PROJECT_ID,
  MONGODB_URL = 'mongodb://localhost:27017',
  notify = console.log,
  reload
} = {}) => {
  if (!PROJECT_ID) {
    throw new Error('Hey, you need to set the PROJECT_ID env var before running this script!');
  }

  return async (meta) => {
    const { policyId, metaTransform, generatorOptions = {} } = meta;
    if (!policyId) {
      throw new Error('Must specify a policy id');
    }

    if (!metaTransform) {
      throw new Error('Must specify a metadata transform');
    }

    console.log({generatorOptions});

    const mongoClient = new MongoClient(MONGODB_URL);
    try {
      await mongoClient.connect();
      notify('Connected to database');

      const { db: { name: dbName, collectionName, metaCollectionName } } = meta;
      const db = mongoClient.db(dbName);
      const collection = db.collection(collectionName);
      const metaCollection = db.collection(metaCollectionName);
      const offset = reload ? 0 : await collection.countDocuments({});

      await ensureUniqueNameIndex(metaCollection);

      console.log('Fetching data from blockfrost...');
      const blockfrost = client({ projectId: PROJECT_ID });
      let count = 0;
      for await (const asset of assetGenerator({ blockfrost, policyId, offset, ...{ generatorOptions } })) {
        await collection.updateOne(
          { 'onchain_metadata.name': asset.onchain_metadata.name },
          { $set: asset }, 
          { upsert: true }
        );
        await metaCollection.updateOne(
          { name: asset.onchain_metadata.name },
          { $set: metaTransform(asset) }, 
          { upsert: true }
        );
        count++;
        if (count % 100 === 0) {
          notify(count);
        }
        await wait(100);
      }

      notify('updating views...');
      for(const transform of meta.viewTransforms) {
        await transform(db);
      }
  
      notify(`Total asset count: ${count + offset}`);
    } catch (err) {
      notify('Error', err);
      throw err;
    } finally {
      mongoClient.close();
    }
  }
}

module.exports = buildLoader;