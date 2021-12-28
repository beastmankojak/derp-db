const _ = require('lodash');

const transform = (traits) => 
  (asset) => 
    _.pick(asset.onchain_metadata, ['name', 'image', ...traits]);

module.exports = transform;