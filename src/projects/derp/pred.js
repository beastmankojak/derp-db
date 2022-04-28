const { 
    collectionNames: { 
      metaCollection, 
      traitCollection, 
      statsCollection 
    },
    defaultTraitTransform,
    defaultRarityTransform,
    defaultStatsTransform,
  } = require('../../transforms');
const metaTransform = require('./custom/predMetaTransform');
  
const traits = [
  'Body', 'Eyes', 'Head', 'Rank', 'Head Gear', 'Back Gear', 'Front Gear', 'Background', 'Skin Color', 'Adaptive Color',
];

const collectionName = 'pred';
const metaCollectionName = metaCollection(collectionName);
const traitCollectionName = traitCollection(collectionName);
const statsCollectionName = statsCollection(collectionName);

const originTraitMapper = (traits) => traits.map((trait) => `attributes.${trait}`);

const meta = {
  policyId: '73056bffdf28f82da5db1f5ac7c06d030c8a551f43889f7f85746a4a',
  db: {
    name: 'derp',
    collectionName,
    metaCollectionName,
    traitCollectionName,
    statsCollectionName
  },
  traits,
};


const finalMeta = {
  ...meta,
  metaTransform: metaTransform(traits),
  viewTransforms: [
    defaultTraitTransform(meta),
    defaultRarityTransform({ ...meta, originTraitMapper }),
    defaultStatsTransform(meta),
  ]
}

module.exports = finalMeta;