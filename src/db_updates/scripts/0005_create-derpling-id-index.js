const migrate = async (mongoClient) => {
  const metaCollection = mongoClient.db('derp').collection('derplingMeta');
  await metaCollection.createIndex(
    { derplingId: 1}, 
    { unique: true }
  );
};

module.exports = migrate;