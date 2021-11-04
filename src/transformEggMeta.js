const { perfectEggs } = require('./constants');

const transformEggMeta = (egg) => {
  const { 
    onchain_metadata: { 
      name, image, 
      attributes: {
        Symbol: symbol, 'Hatch Date': hatchDate, 'X Chromosome': xChromo, 'Y Chromosome': yChromo
      }
    }
  } = egg;

  const [ eggNum ] = name.match(/\d+$/);
  const eggId = `DE${eggNum}`;
  const perfect = perfectEggs[image] || '';

  return {
    eggId, name, image, 
    symbol, hatchDate, xChromo, yChromo, perfect
  };
};

module.exports = transformEggMeta;