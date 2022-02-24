const { MongoClient } = require('mongodb');
const ensureUniqueNameIndex = require('./queries/ensureUniqueNameIndex');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';

const [,,collection, pricingCollectionName] = process.argv;
if (!collection) {
  console.log('ERROR: you must specify a collection to import');
  process.exit(1);
}

if (!pricingCollectionName) {
  console.log('ERROR: you must specify a pricing collection name');
  process.exit(1);
}


const requirePath = `./projects/${collection}`;
const { db: { name: dbName, metaCollectionName } } = require(requirePath);

(async() => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();

    const db = mongoClient.db(dbName);
    const metaCollection = db.collection(metaCollectionName);
    const pricingCollection = db.collection(pricingCollectionName);

    await ensureUniqueNameIndex(pricingCollection);

    let sort = {name: 1};
    let skip = 0;
    let limit = 1000;
    let results = await metaCollection.find({}, { sort, skip, limit }).toArray();
    while (results.length) {
      await pricingCollection.bulkWrite(results.map((item) => ({
        insertOne: {
          document: {
            name: item.name,
            listing: {}
          }
        }
      })));
      skip += limit;
      results = await metaCollection.find({}, { sort, skip, limit }).toArray();
    }  
  } catch (err) {
    console.log('Error:', err);
    process.exit(1);
  } finally {
    if (mongoClient) {
      mongoClient.close();
    }
  }
})();