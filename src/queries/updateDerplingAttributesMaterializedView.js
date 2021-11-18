const buildPipeline = (trait) => ([
  { $group: {
    _id: `${trait}`,
    totalCount: { $sum: 1 },
    [`${trait}`]: { $push: `$${trait}`} ,
  } },
  { $unwind: `$${trait}` },
  { $group: {
    _id: `$${trait}`,      
    count: {$sum: 1},
    totalCount: { $first: '$totalCount' }
  } },
  { $group: {
    _id: `${trait}`,
    values: { 
      $push: { 
        $arrayToObject: { 
          $concatArrays: [ [ { 
            k: '$_id', 
            v: { 
              count: '$count', 
              pct: { 
                $multiply: [ 
                  100, { 
                    $divide: [ '$count', '$totalCount' ]
                  }
                ] 
              } 
            } 
          } ] ] 
        } 
      } 
    }
  } },   
  { $merge: { into: 'derplingAttributes', on: '_id', whenMatched: 'replace' } }  
]);

const traits = [
  'aura', 'beak', 'body', 'eyes', 'head', 'cargo', 'color', 
  'gender', 'eggshell', 'pedestal', 'basecolor', 'dadbodTag'
];

const updateDerplingAttributesMaterializedView = async (collection) => {
  for (trait of traits) {
    await collection.aggregate(buildPipeline(trait)).next();
  }

  const twins = await collection.aggregate([
    { $group: { 
      _id: 'twins',
      totalCount: { $sum: 1 },
      twins: { $sum: { $cond: { if: { $ne: [{ $ifNull: [ '$twin', '' ] }, ''] }, then: 1, else: 0 } } }
    } },
    { $addFields: { 
        notTwins: { $subtract: ['$totalCount', '$twins'] }, 
        twinsPct: { $multiply: [{$divide: ['$twins', '$totalCount']}, 100] }
    } },
    { $addFields: { 
        notTwinsPct: { $multiply: [{$divide: ['$notTwins', '$totalCount']}, 100] }
    } },
    { $project: { 
        _id: 1,
        values: { $concatArrays: [ [
            { yes: { count: '$twins', pct: '$twinsPct' } },    
            { no: { count: '$notTwins', pct: '$notTwinsPct' } },
    ] ]} } },
    { $merge: { into: 'derplingAttributes', on: '_id', whenMatched: 'replace' } }  
  ]).next();
};

module.exports = updateDerplingAttributesMaterializedView;
