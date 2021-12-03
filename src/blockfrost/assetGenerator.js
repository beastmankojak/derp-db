const getAssetsByPolicyId = require('./getAssetsByPolicyId');
const getAsset = require('./getAsset');

async function* assetGenerator({
  blockfrost,
  policyId,
  pageSize = 100,
  offset = 0,
  limit = Infinity
}) {
  if (!blockfrost) {
    throw new Error('blockfrost is a required property of allAssetsOfPolicyId');
  }

  if (!policyId) {
    throw new Error('policyId is a required property of allAssetsOfPolicyId');
  }

  if (!pageSize || pageSize < 1) {
    throw new Error('if pageSize is specified, it must be a positive integer');
  }

  if (!limit) {
    return;
  }

  let totalCount = 0;
  let page = Math.floor(offset/pageSize) + 1;
  const initialOffset = offset % pageSize;

  let assetPage = 
    (await getAssetsByPolicyId({ blockfrost, policyId, page, pageSize }))
    .slice(initialOffset);

  while(assetPage.length) {
    for (const { asset: assetId, quantity } of assetPage) {
      if (quantity !== "1") {
        continue;
      }
      const asset = await getAsset({ blockfrost, assetId });
      yield asset;
      
      totalCount++;
      if (totalCount >= limit) {
        return;
      }
    }

    page++;
    assetPage = await getAssetsByPolicyId({ blockfrost, policyId, page, pageSize });
  }
}

module.exports = assetGenerator;