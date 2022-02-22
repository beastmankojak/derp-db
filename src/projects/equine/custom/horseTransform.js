const _ = require('lodash');

const transform = () => 
  (asset) => asset.onchain_metadata && asset.onchain_metadata.Markings ? {
    ..._.pick(asset.onchain_metadata, ['name', 'image', 'Color', 'Gender', 'Age', 'speed', 'agility', 'stamina', 'endurance', 'acceleration']),
    ..._.pick(asset.onchain_metadata.Markings, ['Body', 'Head', 'Back Left Leg', 'Back Right Leg', 'Front Left Leg', 'Front Right Leg']),
    total: asset.onchain_metadata.speed 
      + asset.onchain_metadata.agility 
      + asset.onchain_metadata.stamina 
      + asset.onchain_metadata.endurance 
      + asset.onchain_metadata.acceleration
  } : {}

module.exports = transform;