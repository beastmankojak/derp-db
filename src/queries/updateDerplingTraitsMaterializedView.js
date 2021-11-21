const updateDerplingTraitsMaterializedView = async (collection) => {
  await collection.aggregate([
    { $project: {
      value: { 
        $filter: { 
          input: { $objectToArray: '$$ROOT' }, 
          as: 'val', 
          cond: { $in: [ 
            '$$val.k', 
            [ 
              'aura', 'beak', 'body', 'eyes', 'head', 'cargo', 'color', 
              'gender', 'eggshell', 'pedestal', 'basecolor', 'dadbodTag'
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
    { $merge: { into: 'derplingTraits', whenMatched: 'replace' } }
  ]).next();

  // add twins
  await collection.aggregate([
    { $group: { 
      _id: 'twins',
      totalCount: { $sum: 1 },
      twins: { $sum: { $cond: { if: { $ne: [{ $ifNull: [ '$twin', '' ] }, ''] }, then: 1, else: 0 } } }
    } },
    { $addFields: { 
      notTwins: { $subtract: ['$totalCount', '$twins'] }, 
    } },
    { $project: { 
      _id: 1,
      values: [ 
        { 
          name: 'yes', 
          count: '$twins', 
          traitRarity: { $divide: [ '$twins', '$totalCount' ] },
          rarityScore: { $divide: [ '$totalCount', '$twins' ] },
          pct: { $multiply: [ { $divide: [ '$twins', '$totalCount' ] }, 100 ] },
        },
        {
          name: 'no',
          count: '$notTwins',
          traitRarity: { $divide: [ '$notTwins', '$totalCount' ] },
          rarityScore: { $divide: [ '$totalCount', '$notTwins' ] },
          pct: { $multiply: [ { $divide: [ '$notTwins', '$totalCount' ] }, 100 ] },
        }
      ] 
    } },
    { $merge: { into: 'derplingTraits', on: '_id', whenMatched: 'replace' } }  
  ]).next();
};

module.exports = updateDerplingTraitsMaterializedView;