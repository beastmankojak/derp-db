const _ = require('lodash');

const transform = (traits) => 
  (asset) => asset.onchain_metadata && asset.onchain_metadata.attributes ? {
    ..._.pick(asset.onchain_metadata, ['name', 'image']),
    ..._.pick(asset.onchain_metadata.attributes, [...traits]),
  } : {};

module.exports = transform;