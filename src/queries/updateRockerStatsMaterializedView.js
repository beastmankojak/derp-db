const updateRockerStatsMaterializedView = (collection) => {
    return collection.aggregate([
      { $group: {
        _id: 'all',
        totalCount: { $sum: 1 },
      } },
      { $addFields: { lastUpdate: new Date() } },
      { $merge: { into: 'rockerStats', on: '_id', whenMatched: 'replace' } }  
    ]).next();
};

module.exports = updateRockerStatsMaterializedView;
