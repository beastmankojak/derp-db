const migrate = async (mongoClient) => {
  const metaCollection = mongoClient.db('bac').collection('babyRockerMeta');
  await metaCollection.createIndex(
    { name: 1}, 
    { unique: true }
  );
};

module.exports = migrate;