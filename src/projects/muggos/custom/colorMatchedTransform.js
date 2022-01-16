const transform = ({ 
  db: {
    collectionName,
    metaCollectionName,
  }
}) => {
  return async(db) => {
    const pipeline = [
      { $project: {
        _id: 0,
        name: '$onchain_metadata.name',
        'Color Matched': { $cond: {
          if : { $eq : [ 
            '$onchain_metadata.Muggo Background', 
            '$onchain_metadata.Muggo Foreground' 
          ] }, 
          then : 'Yes', 
          else : 'No',
        } }
      } },
      { $merge: { into: metaCollectionName, on: 'name', whenMatched: 'merge' } },
    ];
    await db.collection(collectionName).aggregate(pipeline).next();
  }
};

module.exports = transform;