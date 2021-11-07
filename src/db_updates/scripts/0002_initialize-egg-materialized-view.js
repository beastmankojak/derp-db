const lpad5 = require('../../util/lpad5');
const updateEggMaterializedView = require('../../queries/updateEggMaterializedView');

const migrate = async (mongoClient) => {
  const metaCollection = mongoClient.db('derp').collection('eggMeta');
  const { eggId } = await metaCollection.findOne({}, { sort: { eggId: -1 } });
  const maxEggNum = parseInt(eggId.match(/\d+/)[0], 10);
  const ranges = [];
  for(let i = 0; i < maxEggNum; i += 1000) {
    ranges.push({ $gte: `DE${lpad5(i)}`, $lt: `DE${lpad5(i + 1000)}` });
  }

  for (const range of ranges) {
    console.log( `    ${JSON.stringify(range)}`);
    await updateEggMaterializedView(metaCollection, { eggId: range });
  }
};

module.exports = migrate;