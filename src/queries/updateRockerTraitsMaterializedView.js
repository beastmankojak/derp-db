const $first = (array) => ({ $arrayElemAt: [array, 0] });

const updateRockerTraitsMaterializedView = async (collection) => {
  const pipeline = [
    { $project: {
      value: { 
        $filter: { 
          input: { $objectToArray: '$$ROOT' }, 
          as: 'val', 
          cond: { $in: [ 
            '$$val.k', 
            [ 
              'hat', 'body', 'eyes', 'mouth', 'clothes', 'accessory', 'background',
            ] 
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
    { $merge: { into: 'rockerTraits', whenMatched: 'replace' } }
  ];
  await collection.aggregate(pipeline).next();
};

module.exports = updateRockerTraitsMaterializedView;