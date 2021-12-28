const transform = ({ 
  db: {
    statsCollectionName: statsCollection, 
    metaCollectionName
  }
}) => async (db) => {
  const pipeline = [
    { $group: {
      _id: 'all',
      totalCount: { $sum: 1 },
    } },
    { $addFields: { lastUpdate: new Date() } },
    { $merge: { into: statsCollection, on: '_id', whenMatched: 'replace' } }  
  ];

  await db.collection(metaCollectionName).aggregate(pipeline).next();
};

module.exports = transform;
