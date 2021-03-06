const { MongoClient } = require('mongodb');
const got = require('got');
const ensureUniqueNameIndex = require('./queries/ensureUniqueNameIndex');
const wait = require('./util/wait');
const _ = require('lodash');

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
const { db: { name: dbName, metaCollectionName } } = require(requirePath);

const range = (start, length) => Array.apply(null, Array(length)).map((item, i) => i + start);
const id = (i) => '00000'.slice(0, -`${i}`.length) + `${i}`;

const getAllListings = async (url) => {
  let page = 1;
  const listings = [];
  let currentPage = await got(`${url}?page=${page}`).json();
  while (currentPage.length) {
    listings.push(...currentPage);
    page++;
    await wait(100);
    currentPage = await got(`${url}?page=${page}`).json();
  }
  return _.sortBy(listings, 'display_name');
}

(async () => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();

    const db = mongoClient.db(dbName);
    const metaCollection = db.collection(metaCollectionName);
    const pricingCollection = db.collection(pricingCollectionName);

    const numDocuments = await pricingCollection.countDocuments({});

    const listings = await getAllListings(listingsUrl);
    console.log(`Found ${listings.length} listings.`);

    let skip = 0;
    const limit = 1000;
    let ptr = 0;
    let currentListing = listings[ptr];
    let currentListingId = currentListing ? parseInt(currentListing.display_name.slice(-6, -1), 10) : null;

    await ensureUniqueNameIndex(pricingCollection);
    while (skip < numDocuments) {
      await pricingCollection.bulkWrite(
        range(skip, Math.min(limit, numDocuments - skip)).map((i) => {
          let listing = {};
          if (currentListingId === i) {
            listing = currentListing;
            ptr++;
            currentListing = listings[ptr];
            currentListingId = currentListing ? parseInt(currentListing.display_name.slice(-6, -1), 10) : null;
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

    await ensureUniqueNameIndex(db.collection('horseListings'));

    await metaCollection.aggregate([
      { 
          "$lookup" : { 
              "from" : "horseListingsJpegStore", 
              "localField" : "name", 
              "foreignField" : "name", 
              "as" : "jpegListing"
          }
      }, 
      { 
          "$addFields" : { 
              "listing" : { 
                  "price" : { 
                      "$divide" : [
                          { 
                              "$arrayElemAt" : [
                                  "$jpegListing.listing.price_lovelace", 
                                  0.0
                              ]
                          }, 
                          1000000.0
                      ]
                  }, 
                  "url" : { 
                      "$concat" : [
                          "https://www.jpg.store/asset/", 
                          { 
                              "$arrayElemAt" : [
                                  "$jpegListing.listing.asset_id", 
                                  0.0
                              ]
                          }
                      ]
                  }
              }
          }
      }, 
      { 
          "$project" : { 
              "jpegListing" : false
          }
      },
      { $merge: { into: 'horseListings', on: 'name', whenMatched: 'replace' } }
    ]).next();
  } catch (err) {
    console.log('ERROR:', err);
    process.exit(1);
  } finally {
    if (mongoClient) {
      mongoClient.close();
    }
  }
})();