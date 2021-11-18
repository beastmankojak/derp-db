const migrate = async (mongoClient) => {
  const metaCollection = mongoClient.db('derp').collection('derplingMeta');
  await metaCollection.createIndex({
    "aura" : 1,
    "beak" : 1,
    "body" : 1,
    "eyes" : 1,
    "head" : 1,
    "cargo" : 1,
    "color" : 1,
    "eggshell" : 1,
    "pedestal" : 1,
    "basecolor" : 1
  });
};

module.exports = migrate;