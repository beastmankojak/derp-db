const updateDerplingAttributesMaterializedView = (collection) => {
  const pipeline = [
    { $group: { 
        _id: 'all', 
        aura: { $addToSet: '$aura'} ,
        beak: { $addToSet: '$beak'},
        body: { $addToSet: '$body'},
        eyes: { $addToSet: '$eyes'},
        head: { $addToSet: '$head'},
        cargo: {$addToSet: '$cargo'},
        color: {$addToSet: '$color'},
        gender: {$addToSet: '$gender'},
        eggshell:{$addToSet: '$eggshell'},
        pedestal: {$addToSet: '$pedestal'},
        basecolor: {$addToSet: '$basecolor'},
        dadbodTag: {$addToSet: '$dadbodTag'}
    } },
    { $merge: { into: 'derplingAttributes', on: '_id', whenMatched: 'replace' } }  
  ];

  return collection.aggregate(pipeline).next();
};

module.exports = updateDerplingAttributesMaterializedView;
