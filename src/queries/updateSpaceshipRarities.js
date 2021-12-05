const spaceshipTraits = (trait) => ({
  from: 'bacSpaceshipTraits',
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
  'arms', 'ship', 'type', 'cabin', 'cargo', 'effect', 'lights', 'weapon', 
  'texture', 'parasites', 'background', 'propulsion',
];

const updateSpaceshipRarities = async (collection) => {
  const pipeline = [
    { $project: {
      name: '$onchain_metadata.name',
      image: '$onchain_metadata.image',
      arms: '$onchain_metadata.arms',
      ship: '$onchain_metadata.ship',
      type: '$onchain_metadata.type',
      cabin: '$onchain_metadata.cabin',
      cargo: '$onchain_metadata.cargo',
      effect: '$onchain_metadata.effect',
      lights: '$onchain_metadata.lights',
      weapon: '$onchain_metadata.weapon',
      texture: '$onchain_metadata.texture',
      parasites: '$onchain_metadata.parasites',
      background: '$onchain_metadata.background',
      propulsion: '$onchain_metadata.propulsion',
    } },
    ...traitsToInclude.map((trait) => ({ $lookup: spaceshipTraits(trait) })),
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
      spaceship: { $push: '$$ROOT' }
    } },
    { $unwind: { path: '$spaceship', includeArrayIndex: 'rank' } },
    { $project: {
      _id: 0,
      name: '$spaceship.name',
      rarityScore: '$spaceship.rarityScore',
      rank: { $add: [ '$rank', 1 ] }
    } },
    { $merge: { into: 'bacSpaceshipMeta', on: 'name', whenMatched: 'merge' } },
  ];
  await collection.aggregate(pipeline).next();
};

module.exports = updateSpaceshipRarities;