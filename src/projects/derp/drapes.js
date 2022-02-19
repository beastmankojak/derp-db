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
  'Fur', 'Body', 'Ears', 'Eyes', 'Head', 'Skin', 'Mouth', 'Background',
];

const collectionName = 'drapes';
const metaCollectionName = metaCollection(collectionName);
const traitCollectionName = traitCollection(collectionName);
const statsCollectionName = statsCollection(collectionName);

const originTraitMapper = (traits) => traits.map((trait) => `attributes.${trait}`);

const meta = {
  policyId: 'f4873b426a498350c579690bd1f4a369d5d7b521c778acf322f77334',
  db: {
    name: 'derp',
    collectionName,
    metaCollectionName,
    traitCollectionName,
    statsCollectionName
  },
  traits,
  generatorOptions: {
    quantityOk: (quantity) => quantity >= 1
  }
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