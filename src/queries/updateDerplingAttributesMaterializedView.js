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
};

module.exports = updateDerplingAttributesMaterializedView;
