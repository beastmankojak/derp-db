const transformDerpMeta = require('../../transformDerpMeta');

const migrate = async (mongoClient) => {
  const derpCollection = mongoClient.db('derp').collection('derps');
  const metaCollection = mongoClient.db('derp').collection('derpMeta');
  const allDerps = await derpCollection.find({});
  for await (const _derp of allDerps) {
    const derp = transformDerpMeta(_derp);
    const { derpId } = derp;
    await metaCollection.updateOne({ derpId }, { $set: { ...derp } }, { upsert: true });
  }
};

module.exports = migrate;