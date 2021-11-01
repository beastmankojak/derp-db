const getAssetsByPolicyId = async ({
  blockfrost,
  policyId,
  page = 1,
  pageSize = 100
}) => {
  if (!blockfrost) {
    throw new Error('blockfrost is a required property of allAssetsOfPolicyId');
  }

  if (!policyId) {
    throw new Error('policyId is a required property of allAssetsOfPolicyId');
  }

  if (!pageSize || pageSize < 1) {
    throw new Error('if pageSize is specified, it must be a positive integer');
  }

  if (!page || page < 1) {
    throw new Error('if page is specified, it must be a positive integer');
  }

  const { body, statusCode, statusMessage } = 
    await blockfrost.get(`assets/policy/${policyId}?page=${page}&count=${pageSize}`);
  if (statusCode !== 200) {
    console.log('Error', { body, statusCode, statusMessage });
    throw new Error('Error fetching assets of policy');
  }

  return body;
};

module.exports = getAssetsByPolicyId;

