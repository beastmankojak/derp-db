const derplingTraits = (trait) => ({
  from: 'derplingTraits',
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

const traitsToInclude = [
  'aura', 'beak', 'body', 'eyes', 'head', 'cargo', 
  'color', 'pedestal', 'eggshellBucket', //'dadbodBoost'
];

const updateDerplingRarities = async (collection) => {
  const pipeline = [
    { $project: {
      derplingId: { 
        $let: { 
          vars: { num: { $regexFind: { input: '$onchain_metadata.name', regex: /\d+$/ } } },
          in: {$concat: [ 'DR', '$$num.match' ]},
        }
      },
      name: '$onchain_metadata.name',
      image: '$onchain_metadata.image',
      aura: '$onchain_metadata.attributes.aura',
      beak: '$onchain_metadata.attributes.beak',
      body: '$onchain_metadata.attributes.body',
      eyes: '$onchain_metadata.attributes.eyes',
      head: '$onchain_metadata.attributes.head',
      cargo: '$onchain_metadata.attributes.cargo',
      color: '$onchain_metadata.attributes.color',
      father: '$onchain_metadata.attributes.father',
      gender: '$onchain_metadata.attributes.gender',
      eggshell: '$onchain_metadata.attributes.eggshell',
      eggshellBucket: { 
        $cond: { 
          if: { $eq: [ '$onchain_metadata.attributes.eggshell', 'PRED']}, 
          then: 'PRED', 
          else: { 
            $cond: { 
              if: { $regexMatch: { input: '$onchain_metadata.attributes.eggshell', regex: /Derp/ } }, 
              then: 'Derp', 
              else: 'Perfect'
            }
          }
        }
      },
      dadbodBoost: {
        $cond: {
          if: { $eq: [ '$onchain_metadata.attributes.dadbodTag', 'None'] },
          then: 'No',
          else: 'Yes'
        }
      },
      pedestal: '$onchain_metadata.attributes.pedestal',
      basecolor: '$onchain_metadata.attributes.basecolor',
      dadbodTag: '$onchain_metadata.attributes.dadbodTag',
    } },
    ...traitsToInclude.map((trait) => ({ $lookup: derplingTraits(trait) })),
    { $project: {
      _id: 1, derplingId: 1, 
      rarityScore: { 
        $sum: traitsToInclude.map((trait) => ({
          $arrayElemAt: [`$${trait}Stats._id.scaledRarityScore`, 0] 
        }))
      },
    }},
    { $sort: { rarityScore: -1 } },
    { $group: { 
      _id: 1,
      derpling: { $push: '$$ROOT' }
    } },
    { $unwind: { path: '$derpling', includeArrayIndex: 'rank' } },
    { $project: {
      _id: 0,
      derplingId: '$derpling.derplingId',
      rarityScore: '$derpling.rarityScore',
      rank: { $add: [ '$rank', 1 ] }
    } },
    { $merge: { into: 'derplingMeta', on: 'derplingId', whenMatched: 'merge' } },
  ];

  await collection.aggregate(pipeline).next();
};

module.exports = updateDerplingRarities;