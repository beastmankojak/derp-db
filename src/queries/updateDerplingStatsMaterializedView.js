const updateDerplingAttributesMaterializedView = (collection) => {
    return collection.aggregate([
      { $group: {
        _id: 'all',
        totalCount: { $sum: 1 },
      } },
      { $addFields: { lastUpdate: new Date() } },
      { $merge: { into: 'derplingStats', on: '_id', whenMatched: 'replace' } }  
    ]).next();
};

module.exports = updateDerplingAttributesMaterializedView;
