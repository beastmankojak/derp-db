const { MongoClient } = require('mongodb');

const client = require('./blockfrost/client');
const assetGenerator = require('./blockfrost/assetGenerator');
const wait = require('./util/wait');
const ensureUniqueNameIndex = require('./queries/ensureUniqueNameIndex');
const { S3Client } = require("@aws-sdk/client-s3");
const cacheImage = require('./ipfs/cacheImage');

const configureS3 = ({s3}) => {
  if (s3) {
    return new S3Client({
      endpoint: 'https://nyc3.digitaloceanspaces.com',
      region: "us-east-1",
    });
  }
};

const buildLoader = ({
  PROJECT_ID,
  MONGODB_URL = 'mongodb://localhost:27017',
  notify = console.log,
  reload,
  limit
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

      const s3 = configureS3(meta);
      const { s3: { bucket, basePath, extension, sizes } = {} } = meta;

      console.log('Fetching data from blockfrost...');
      const blockfrost = client({ projectId: PROJECT_ID });
      let count = 0;
      for await (const asset of assetGenerator({ blockfrost, policyId, offset, ...{ generatorOptions }, ...(limit ? { limit } : {}) })) {
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

        if (s3) {
          await cacheImage({ ipfsHash: asset.onchain_metadata.image.slice(7), extension, sizes, s3, bucket, path: basePath});
        }
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