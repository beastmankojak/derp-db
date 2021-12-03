const rockerTraits = (trait) => ({
  from: 'rockerTraits',
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
  'hat', 'body', 'eyes', 'mouth', 'clothes', 'accessory', 'background',
];

const updateRockerRarities = async (collection) => {
  const pipeline = [
    { $project: {
      name: '$onchain_metadata.name',
      image: '$onchain_metadata.image',
      hat: '$onchain_metadata.hat',
      body: '$onchain_metadata.body',
      eyes: '$onchain_metadata.eyes',
      mouth: '$onchain_metadata.mouth',
      clothes: '$onchain_metadata.clothes',
      accessory: '$onchain_metadata.accessory',
      background: '$onchain_metadata.background',
    } },
    ...traitsToInclude.map((trait) => ({ $lookup: rockerTraits(trait) })),
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
      rocker: { $push: '$$ROOT' }
    } },
    { $unwind: { path: '$rocker', includeArrayIndex: 'rank' } },
    { $project: {
      _id: 0,
      name: '$rocker.name',
      rarityScore: '$rocker.rarityScore',
      rank: { $add: [ '$rank', 1 ] }
    } },
    { $merge: { into: 'babyRockerMeta', on: 'name', whenMatched: 'merge' } },
  ];
  await collection.aggregate(pipeline).next();
};

module.exports = updateRockerRarities;