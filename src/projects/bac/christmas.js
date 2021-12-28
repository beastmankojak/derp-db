const { 
  collectionNames: { 
    metaCollection, 
    traitCollection, 
    statsCollection 
  },
  defaultMetaTransform,
  defaultTraitTransform,
  defaultRarityTransform,
  defaultStatsTransform,
} = require('../../transforms');

const traits = [
  'hat', 'body', 'eyes', 'face', 'clothes', 'texture', 'accessory', 'background',
];

const collectionName = 'bacChristmas';
const metaCollectionName = metaCollection(collectionName);
const traitCollectionName = traitCollection(collectionName);
const statsCollectionName = statsCollection(collectionName);

const meta = {
  policyId: '2f641f799b2a8fde7a4d3659765f5bbee2f853db32b86668917e3c77',
  db: {
    name: 'bac',
    collectionName,
    metaCollectionName,
    traitCollectionName,
    statsCollectionName
  },
  traits,
};

const finalMeta = {
  ...meta,
  metaTransform: defaultMetaTransform(traits),
  viewTransforms: [
    defaultTraitTransform(meta),
    defaultRarityTransform(meta),
    defaultStatsTransform(meta),
  ]
}

module.exports = finalMeta;