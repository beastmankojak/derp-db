const getAsset = async ({
  blockfrost,
  assetId,
}) => {
  if (!blockfrost) {
    throw new Error('blockfrost is a required property of allAssetsOfPolicyId');
  }

  if (!assetId) {
    throw new Error('assetId is a required property of allAssetsOfPolicyId');
  }

  const { body, statusCode, statusMessage } = 
    await blockfrost.get(`assets/${assetId}`);
  if (statusCode !== 200) {
    console.log('Error', { body, statusCode, statusMessage });
    throw new Error('Error fetching specific asset');
  }

  return body;
};

module.exports = getAsset;

