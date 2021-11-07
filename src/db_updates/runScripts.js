const migrations = require('./scripts');

const runScripts = async (mongoClient) => {
  const migrationsCollection = mongoClient.db('derp').collection('migrations');
  const lastMigration = await migrationsCollection.findOne({}, { sort: [[ 'key', 'desc' ]] });
  const { key: lastRunKey } = lastMigration || {};
  const migrationKeys = Object.keys(migrations)
    .filter((key) => lastRunKey == null || key > lastRunKey)
    .sort((a, b) => a > b ? 1 : a < b ? -1 : 0);

  if (migrationKeys.length) {
    console.log(`Running ${migrationKeys.length} script${migrationKeys.length === 1 ? '' : 's'}...`);
    for (const key of migrationKeys) {
      console.log(`Running script ${key}...`);
      await migrations[key](mongoClient);
      await migrationsCollection.insertOne({ key, runAt: new Date() });
    }
  }
  console.log('Db is up to date.');
};

module.exports = runScripts;