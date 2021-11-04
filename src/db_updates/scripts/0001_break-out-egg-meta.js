const transformEggMeta = require('../../transformEggMeta');

const migrate = async (mongoClient) => {
  const eggCollection = mongoClient.db('derp').collection('eggs');
  const metaCollection = mongoClient.db('derp').collection('eggMeta');
  const allEggs = await eggCollection.find({});
  for await (const _egg of allEggs) {
    const egg = transformEggMeta(_egg);
    const { eggId } = egg;
    metaCollection.updateOne({ eggId }, { $set: { ...egg } }, { upsert: true });
  }
};

module.exports = migrate;