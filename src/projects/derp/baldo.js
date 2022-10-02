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
const metaTransform = require('./custom/metaTransform');

const traits = [
'Beak', 'Body', 'Eyes', 'Head', 'Mouth', 'Background',
];

const collectionName = 'baldo';
const metaCollectionName = metaCollection(collectionName);
const traitCollectionName = traitCollection(collectionName);
const statsCollectionName = statsCollection(collectionName);

const originTraitMapper = (traits) => traits.map((trait) => `attributes.${trait}`);

const meta = {
policyId: '60b741294ee35c3de6f06a7060ff27422956f54d50339a4f445423e0',
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
  ],
  s3: {
    bucket: 'beastmankojak',
    basePath: 'derp/baldo/ipfs',
    extension: 'png',
    sizes: [200],
  }
};

module.exports = finalMeta;