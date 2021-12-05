const migrate = async (mongoClient) => {
  const metaCollection = mongoClient.db('bac').collection('bacSpaceshipMeta');
  await metaCollection.createIndex(
    { name: 1}, 
    { unique: true }
  );
};

module.exports = migrate;