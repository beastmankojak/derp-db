const transformDerpMeta = (derp) => {
  const { 
    onchain_metadata: { 
      name, image, score, rarity, 
      attributes: {
        back, body, ears, eyes, head, tail, color, beakface, basecolor, perfect
      }
    }
  } = derp;

  const [ derpNum ] = name.match(/\d+$/);
  const derpId = `DP${derpNum}`;

  return {
    derpId, name, image, score, rarity,
    back, body, ears, eyes, head, tail, color, beakface, basecolor, perfect: perfect ? back : ''
  };
};

module.exports = transformDerpMeta;