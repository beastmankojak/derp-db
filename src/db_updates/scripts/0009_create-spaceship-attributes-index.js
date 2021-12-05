const migrate = async (mongoClient) => {
  const metaCollection = mongoClient.db('bac').collection('bacSpaceshipMeta');
  await metaCollection.createIndex({
    arms: 1,
    ship: 1,
    type: 1,
    cabin: 1,
    cargo: 1,
    effect: 1,
    lights: 1,
    weapon: 1,
    texture: 1,
    parasites: 1,
    background: 1,
    propulsion: 1,
  });
};

module.exports = migrate;