const updateTwins = async (collection) => {
  const pipeline = [
    { $lookup: {
      from: 'derpMeta',
      localField: 'yChromo',
      foreignField: 'derpId',
      as: 'parent'
    } },
    { $project: { eggId: 1, name: 1, image: 1, symbol: 1, hatchDate: 1, xChromo: 1, yChromo: 1, perfect: 1,
        parent: { $arrayElemAt: ['$parent', 0] } } },
    { $merge: { into: 'eggsWithParent' } }  
  ];

  const twins = await collection.aggregate([
    { $lookup: {
      from: 'derplingMeta',
      let: { 
          twin_aura: '$aura', twin_beak: '$beak', twin_body: '$body', twin_eyes: '$eyes',
          twin_head: '$head', twin_cargo: '$cargo', twin_color: '$color', twin_eggshell: '$eggshell',
          twin_pedestal: '$pedestal', twin_basecolor: '$basecolor', twin_name: '$name'
      },
      pipeline: [
        { $match: { $expr: {
            $and: [
              { $eq: [ '$aura', '$$twin_aura' ] },
              { $eq: [ '$beak', '$$twin_beak' ] },
              { $eq: [ '$body', '$$twin_body' ] },
              { $eq: [ '$eyes', '$$twin_eyes' ] },
              { $eq: [ '$head', '$$twin_head' ] },
              { $eq: [ '$cargo', '$$twin_cargo' ] },
              { $eq: [ '$color', '$$twin_color' ] },
              { $eq: [ '$eggshell', '$$twin_eggshell' ] },
              { $eq: [ '$pedestal', '$$twin_pedestal' ] },
              { $eq: [ '$basecolor', '$$twin_basecolor' ] },
              { $ne: [ '$name', '$$twin_name' ] }
            ]
        } } }
      ],
      as: 'twins'
    } },
    { $match: { 'twins.0': { $exists: 1 } } } ,
    { $addFields: { twin: { $arrayElemAt: ['$twins', 0] } } }  ,
    { $project: { _id: 1, derplingId: 1, twin: '$twin.derplingId' } },
  ]).toArray();

  for ({ derplingId, twin } of twins) {
    await collection.updateOne({ derplingId }, { $set: { twin } });
  }
};

module.exports = updateTwins;