const transformDerplingMeta = (derpling) => {
  const { 
    onchain_metadata: { 
      name, image, 
      attributes: {
        aura, beak, body, eyes, head, cargo, color, father, gender, eggshell, pedestal, basecolor, dadbodTag
      }
    }
  } = derpling;

  const [ derplingNum ] = name.match(/\d+$/);
  const derplingId = `DR${derplingNum}`;

  return {
    derplingId, name, image, 
    aura, beak, body, eyes, head, cargo, color, father, gender, eggshell, pedestal, basecolor, dadbodTag
  };
};

module.exports = transformDerplingMeta;