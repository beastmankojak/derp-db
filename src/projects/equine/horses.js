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
const metaTransform = require('./custom/horseTransform');

const rareTraits = [ 'Color', 'Gender', 'Body', 'Head', 'Back Left Leg', 'Back Right Leg', 'Front Left Leg', 'Front Right Leg' ];
const numberTraits = [ 'Age', 'speed', 'agility', 'stamina', 'endurance', 'acceleration' ];

const traits = [
  ...rareTraits, ...numberTraits,
];

const traitMapper = {
  Body: 'Markings.Body',
  Head: 'Markings.Head',
  'Back Left Leg': 'Markings.Back Left Leg',
  'Back Right Leg': 'Markings.Back Right Leg',
  'Front Left Leg': 'Markings.Front Left Leg',
  'Front Right Leg': 'Markings.Front Right Leg',
};

const collectionName = 'horses';
const metaCollectionName = metaCollection(collectionName);
const traitCollectionName = traitCollection(collectionName);
const statsCollectionName = statsCollection(collectionName);

const originTraitMapper = (traits) => traits.map((trait) => traitMapper[trait] || trait);

const meta = {
  policyId: '30ed3d95db1d6bb2c12fc5228a2986eab4553f192a12a4607780e15b',
  db: {
    name: 'equine',
    collectionName,
    metaCollectionName,
    traitCollectionName,
    statsCollectionName
  },
  traits,
};


const finalMeta = {
  ...meta,
  metaTransform: metaTransform(),
  viewTransforms: [
    defaultTraitTransform({ ...meta, traits: rareTraits }),
    defaultRarityTransform({ ...meta, traits: rareTraits, originTraitMapper }),
    defaultStatsTransform(meta),
  ]
}

module.exports = finalMeta;