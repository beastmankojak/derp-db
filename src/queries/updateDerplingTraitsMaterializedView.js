const upperBound = 1;
const lowerBound = .02;
const scaledRarity = { $add: [ { $multiply: [ upperBound - lowerBound, { $divide: [ '$count', '$totalCount' ] } ] }, lowerBound ] };

const $first = (array) => ({ $arrayElemAt: [array, 0] });

const ifBlock = (field, match) => {
  if (typeof match === 'string') {
    return { $eq: [ field, match ] };
  }
  if (match instanceof RegExp) {
    return { $regexMatch: { input: field, regex: match } };
  }
  throw new Error('unrecognized option for if block');
};

const conditionChain = (conditions, field, k, defaultVal) => {
  if (!conditions || !conditions.length) {
    throw new Error('conditions must have a length of at least 1');
  }

  const [{match, v }] = conditions;
  if (conditions.length === 1) {
    return { 
      $cond: { 
        if: ifBlock(field, match), 
        then: { k, v }, 
        else: { k, v: defaultVal } 
      } 
    };
  } else {
    return { 
      $cond: {
        if: ifBlock(field, match),
        then: { k, v },
        else: conditionChain(conditions.slice(1), field, k, defaultVal)
      }
    }
  }
};

const makeBucket = (name) => ({
  bucket: $first({
    $filter: { 
      input: '$value', 
      as: 'val', 
      cond: { $eq: ['$$val.k', name]}
    }
  })
});

const fillBuckets = ({ source, target, defaultVal, conditions }) => ({ 
  $project: { 
    value: { 
      $concatArrays: [ 
        '$value', 
        [ { $let: { 
          vars: makeBucket(source), 
          in: conditionChain(conditions, '$$bucket.v', target, defaultVal ) 
        } } ]
      ]
    }
  }
});

const updateDerplingTraitsMaterializedView = async (collection) => {
  const pipeline = [
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
    fillBuckets({ 
      source: 'eggshell',
      target: 'eggshellBucket',
      defaultVal: 'Perfect',
      conditions: [
        { match: 'PRED', v: 'PRED' },
        { match: /Derp/, v: 'Derp' },
      ],
    }),
    fillBuckets({
      source: 'dadbodTag',
      target: 'dadbodBoost',
      // Note: these are reversed so that if the dadbodTag is none, we get the "Yes" bucket
      // which has a higher count and therefore a lower rarity score.  This will effectively
      // boost the dadbod tags without boosting when the tag is not there.
      defaultVal: 'No',
      conditions: [
        { match: 'None', v: 'Yes' }
      ]
    }), 
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
  ];
  await collection.aggregate(pipeline).next();

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