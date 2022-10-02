const got = require('got');
const _ = require('lodash');

const ipfsHosts = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://ipfs.fleek.co/ipfs/',
];

const fetchImage = async ({ipfsHash}) => {
  const hosts = _.shuffle(ipfsHosts);
  for (const host of hosts) {
    try {
      console.log(`trying host ${host}...`);
      const bytes = await got(`${host}${ipfsHash}`, {
        timeout: { request: 10000 },
      }).buffer();
      console.log('success.');
      return bytes;
    } catch (err) {
      console.log(`Error fetching file from host ${host}`);
      console.log(err);
    }
  }

  console.log('Unable to fetch file from ipfs');
};

module.exports = fetchImage;