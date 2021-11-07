const updateEggMaterializedView = (collection, $match) => {
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

  if ($match) {
    pipeline.splice(0, 0, { $match });
  }

  return collection.aggregate(pipeline).next();
};

module.exports = updateEggMaterializedView;