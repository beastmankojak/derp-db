const migrate = async (mongoClient) => {
  const metaCollection = mongoClient.db('bac').collection('babyRockerMeta');
  await metaCollection.createIndex({
    "hat" : 1,
    "body" : 1,
    "eyes" : 1,
    "mouth" : 1,
    "clothes" : 1,
    "accessory" : 1,
    "backtround" : 1,
  });
};

module.exports = migrate;