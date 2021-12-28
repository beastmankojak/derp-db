const fs = require('fs');
const path = require('path');

const buildLoader = require('./buildLoader');

const [,,collection] = process.argv;
if (!collection) {
  console.log('ERROR: you must specify a collection to import');
  process.exit(1);
}

const collectionAbsPath = path.join(__dirname, 'projects', `${collection}.js`);
if (!fs.existsSync(collectionAbsPath)) {
  console.log(`ERROR: collection meta file for ${collection} does not exist: ${collectionAbsPath}`);
  process.exit(1);
}

const requirePath = `./projects/${collection}`;
const meta = require(requirePath);

const PROJECT_ID = process.env.PROJECT_ID;
const MONGODB_URL = process.env.MONGODB_URL;

const importFn = buildLoader({ PROJECT_ID, MONGODB_URL });
(async () => {
  importFn(meta);
})();
