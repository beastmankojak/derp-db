const { MongoClient } = require('mongodb');
const got = require('got');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';

const [,, collection, pricingCollectionName, listingsUrl] = process.argv;

if (!collection) {
  console.log('ERROR: you must specify a collection to import');
  process.exit(1);
}

if (!pricingCollectionName) {
  console.log('ERROR: you must specify a pricing collection name');
  process.exit(1);
}

if (!listingsUrl) {
  console.log('ERROR: you must specify a listings url');
  process.exit(1);
}

const requirePath = `./projects/${collection}`;
const { db: { name: dbName } } = require(requirePath);

const range = (start, length) => Array.apply(null, Array(length)).map((item, i) => i + start);
const id = (i) => '00000'.slice(0, -`${i}`.length) + `${i}`;

(async () => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();

    const db = mongoClient.db(dbName);
    const pricingCollection = db.collection(pricingCollectionName);

    const numDocuments = await pricingCollection.countDocuments({});

    const listings = (await got(listingsUrl).json());
    console.log(`Found ${listings.count} listings.`);

    let skip = 0;
    const limit = 1000;
    let ptr = 0;
    let currentListing = listings[ptr];
    let currentListingId = currentListing ? parseInt(currentListing.asset_display_name.slice(-6, -1), 10) : null;
    while (skip < numDocuments) {
      await pricingCollection.bulkWrite(
        range(skip, Math.min(limit, numDocuments - skip)).map((i) => {
          let listing = {};
          if (currentListingId === i) {
            listing = currentListing;
            ptr++;
            currentListing = listings[ptr];
            currentListingId = currentListing ? parseInt(currentListing.asset_display_name.slice(-6, -1), 10) : null;
          }
          return {
            updateOne: {
              filter: { name: `Equine Pioneer Horse [${id(i)}]` },
              update: { $set: { listing } }
            }
          };
        })
      );
      skip += limit;
    }
  } catch (err) {
    console.log('ERROR:', err);
    process.exit(1);
  } finally {
    if (mongoClient) {
      mongoClient.close();
    }
  }
})();