const $first = require('../util/first');

const transform = ({
  traits, 
  db: {
    traitCollectionName: traitCollection, 
    metaCollectionName
  }
}) => async (db) => {
  const pipeline = [
    { $project: {
      value: { 
        $filter: { 
          input: { $objectToArray: '$$ROOT' }, 
          as: 'val', 
          cond: { $in: [ 
            '$$val.k', 
            [ ...traits ] 
          ] } 
        } 
      }
    } },
    { $unwind: '$value' },
    { $group: {
      _id: '$value.k',
      totalCount: { $sum: 1 },
      value: { $push: '$value.v' }
    } },
    { $unwind: '$value' },
    { $group: {
      _id: { $concat: ['$_id', '.', '$value'] },
      trait: { $first: '$_id' },
      name: { $first: '$value' },
      count: {$sum: 1},
      totalCount: { $first: '$totalCount' }
    } },
    { $group: {
      _id: '$trait',
      values: { 
        $push: { 
          name: '$name',
          count: '$count',
          traitRarity: { $divide: [ '$count', '$totalCount' ] },
          rarityScore: { $divide: [ '$totalCount', '$count' ] },
          pct: { $multiply: [ { $divide: ['$count', '$totalCount' ] }, 100 ] },
        }
      }
    } },
    { $merge: { into: traitCollection, whenMatched: 'replace' } }
  ];
  await db.collection(metaCollectionName).aggregate(pipeline).next();
};

module.exports = transform;