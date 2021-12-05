const transformSpaceshipMeta = (spaceship) => {
  const { 
    onchain_metadata: { 
      name, image, //Project
      arms, ship, type, cabin, cargo, effect, lights, weapon, 
      texture, parasites, background, propulsion,
    }
  } = spaceship;

  return {
    name, image, 
    arms, ship, type, cabin, cargo, effect, lights, weapon, 
    texture, parasites, background, propulsion,
  };
};

module.exports = transformSpaceshipMeta;