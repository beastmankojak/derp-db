const { MongoClient } = require('mongodb');

const { perfectEggs } = require('./constants');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';

(async () => {
  const mongoClient = new MongoClient(MONGODB_URL);
  try {
    await mongoClient.connect();
    console.log('Connected to database');
    const eggCollection = mongoClient.db('derp').collection('eggs');
    const derpCollection = mongoClient.db('derp').collection('derps');

    console.log('id, symbol, x chromosome, y chromosome, perfect, dad rarity, dad back, dad body, dad ears, dad eyes, dad head, dad tail, dad color, dad beakface, dad basecolor');
    const cursor = eggCollection.find({});

    for await (const { onchain_metadata: {name, image, attributes} } of cursor) {
      const [, dadNum] = attributes['Y Chromosome'].match(/(\d+)/);
      const {
        onchain_metadata: {
          rarity,
          attributes: {
            back,
            body,
            ears,
            eyes,
            head,
            tail,
            color,
            beakface,
            basecolor
          }
        }
      } = (await derpCollection.findOne({ 'onchain_metadata.name': new RegExp(dadNum) })) 
        || {onchain_metadata: { attributes: {}}};
      console.log(
        `${name}, ${attributes.Symbol}, "${attributes['X Chromosome']}", ${attributes['Y Chromosome']}, ${perfectEggs[image] || ''}, ` +
        `${rarity || ''}, ${back || ''}, ${body || ''}, ${ears || ''}, ${eyes || ''}, ${head || ''}, ` +
        `${tail || ''}, ${color || ''}, ${beakface || ''}, ${basecolor || ''}`);
    }
  } catch (err) {
    console.log('Error', err);
    process.exit(1);
  } finally {
    mongoClient.close();
  }
})();
