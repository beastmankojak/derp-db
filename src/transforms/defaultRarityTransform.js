const _ = require('lodash');

const transform = ({ 
  traits: traitsToInclude, 
  db: {
    traitCollectionName: traitCollection,
    metaCollectionName: metaCollection, 
    collectionName
  },
  originTraitMapper
}) => {
  const buildTraits = (trait) => ({
    from: traitCollection,
    let: { 'trait': `$${trait}` },
    pipeline: [
      { $match: {
        _id: `${trait}`,
      } },
      { $project:  {
        _id: { 
          $arrayElemAt: [ { 
            $filter: { 
              input: '$values', 
              as: 'value', 
              cond: { $eq: ['$$trait', '$$value.name'] } 
            } 
          }, 0]
        } ,
      } },
    ],
    as: `${trait}Stats`
  });

  const targetTraits = [ 'name', 'image', ...traitsToInclude ];
  const originTraits = [ 'name', 'image', ...(originTraitMapper ? originTraitMapper(traitsToInclude) : traitsToInclude) ];
  
  return async (db) => {
    const pipeline = [
      { $project: 
        _.zipObject(targetTraits, originTraits.map((trait) => `$onchain_metadata.${trait}`)),
      },
      ...traitsToInclude.map((trait) => ({ $lookup: buildTraits(trait) })),
      { $project: {
        _id: 1, name: 1, 
        rarityScore: { 
          $sum: traitsToInclude.map((trait) => ({
            $arrayElemAt: [`$${trait}Stats._id.rarityScore`, 0] 
          }))
        },
      }},
      { $sort: { rarityScore: -1 } },
      { $group: { 
        _id: 1,
        asset: { $push: '$$ROOT' }
      } },
      { $unwind: { path: '$asset', includeArrayIndex: 'rank' } },
      { $project: {
        _id: 0,
        name: '$asset.name',
        rarityScore: '$asset.rarityScore',
        rank: { $add: [ '$rank', 1 ] }
      } },
      { $merge: { into: metaCollection, on: 'name', whenMatched: 'merge' } },
    ];
    await db.collection(collectionName).aggregate(pipeline).next();
  }
};

module.exports = transform;
