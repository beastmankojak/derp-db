const got = require('got');

const BLOCKFROST_MAINNET = 'https://cardano-mainnet.blockfrost.io/api/v0';

const client = ({ projectId, prefixUrl = BLOCKFROST_MAINNET }) => {
  if (!projectId) {
    throw new Error('projectId is a required property when creating a blockfrost client');
  }

  return got.extend({ 
    prefixUrl,
    hooks: {
      beforeRequest: [
        options => {
          options.headers.project_id = projectId;
        }
      ]
    },
    responseType: 'json'
  });
};

module.exports = client;