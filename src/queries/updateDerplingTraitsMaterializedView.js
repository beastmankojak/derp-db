const upperBound = 1;
const lowerBound = .02;
const scaledRarity = { $add: [ { $multiply: [ upperBound - lowerBound, { $divide: [ '$count', '$totalCount' ] } ] }, lowerBound ] }

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
    { $project: {
      "value" : { 
        "$concatArrays" : [
            "$value", 
            [
                { 
                    "$let" : { 
                        "vars" : { 
                            "eggshell" : { 
                                "$arrayElemAt" : [
                                    { 
                                        "$filter" : { 
                                            "input" : "$value", 
                                            "as" : "val", 
                                            "cond" : { 
                                                "$eq" : [
                                                    "$$val.k", 
                                                    "eggshell"
                                                ]
                                            }
                                        }
                                    }, 
                                    0.0
                                ]
                            }
                        }, 
                        "in" : { 
                            "$cond" : { 
                                "if" : { 
                                    "$eq" : [
                                        "$$eggshell.v", 
                                        "PRED"
                                    ]
                                }, 
                                "then" : { 
                                    "k" : "eggshellBucket", 
                                    "v" : "PRED"
                                }, 
                                "else" : { 
                                    "$cond" : { 
                                        "if" : { 
                                            "$regexMatch" : { 
                                                "input" : "$$eggshell.v", 
                                                "regex" : /Derp/
                                            }
                                        }, 
                                        "then" : { 
                                            "k" : "eggshellBucket", 
                                            "v" : "Derp"
                                        }, 
                                        "else" : { 
                                            "k" : "eggshellBucket", 
                                            "v" : "Perfect"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        ]
      }
    }},
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
          scaledRarity,
          rarityScore: { $divide: [ '$totalCount', '$count' ] },
          scaledRarityScore: { $divide: [ 1, scaledRarity ] },
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