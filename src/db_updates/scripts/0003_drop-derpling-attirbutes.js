const migrate = async (mongoClient) => {
  const metaCollection = mongoClient.db('derp').collection('derplingAttributes');
  await metaCollection.drop();
};

module.exports = migrate;