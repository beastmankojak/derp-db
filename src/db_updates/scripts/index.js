const fs = require('fs');
const path = require('path');

const migrations = {};
const files = fs.readdirSync(__dirname).filter((filename) => /^\d{4}_.*\.js$/.test(filename));
for (const filename of files) {
  const key = filename.substring(0, 4);
  migrations[key] = require(path.join(__dirname, filename));
}

module.exports = migrations;