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
const muggosTransform = require('./custom/muggosTransform');
const colorMatchedTransform = require('./custom/colorMatchedTransform');

const traits = [
  "Muggo Age",
  "Muggo Back",
  "Muggo Head",
  "Muggo Rank",
  "Muggo Color",
  "Muggo Height",
  "Muggo Accessory",
  "Muggo Background",
  "Muggo Foreground",
  "Muggo Gameplay Proficiency",
  "Muggo Gameplay Attributes",
  "Sidekick",
  "Sidekick Gem",
  "Sidekick Ears",
  "Sidekick Horn",
  "Sidekick Nose",
  "Sidekick Color",
  "Sidekick Teeth",
  "Sidekick Tummy",
  "Sidekick Wings",
  "Sidekick Ear Color",
  "Sidekick Eye Color",
  "Sidekick Gem Color",
  "Sidekick Horn Color",
  "Sidekick Nose Color",
  "Sidekick Teeth Color",
  "Sidekick Tummy Color",
  "Sidekick Wings Color",
];

const transformedTraits = [
  "Muggo Back",
  "Muggo Head",
  "Muggo Rank",
  "Muggo Color",
  "Muggo Accessory",
  "Muggo Background",
  "Muggo Foreground",
  "Color Matched",
  "Muggo Gameplay Proficiency",
  "Sidekick",
  "Sidekick Gem",
  "Sidekick Ears",
  "Sidekick Horn",
  "Sidekick Nose",
  "Sidekick Teeth",
  "Sidekick Tummy",
  "Sidekick Wings",
]

const collectionName = 'muggos';
const metaCollectionName = metaCollection(collectionName);
const traitCollectionName = traitCollection(collectionName);
const statsCollectionName = statsCollection(collectionName);

const meta = {
  policyId: 'c263bfde10889d62d63b158bed9906795226c044138ee490f1b785d4',
  db: {
    name: 'muggos',
    collectionName,
    metaCollectionName,
    traitCollectionName,
    statsCollectionName
  },
  traits,
};

const finalMeta = {
  ...meta,
  metaTransform: muggosTransform(defaultMetaTransform(traits)),
  viewTransforms: [
    colorMatchedTransform({ ...meta }),
    defaultTraitTransform({ ...meta, traits: transformedTraits }),
    defaultRarityTransform({ ...meta, traits: transformedTraits }),
    defaultStatsTransform(meta),
  ]
}

module.exports = finalMeta;