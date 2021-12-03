const transformRockerMeta = (rocker) => {
  const { 
    onchain_metadata: { 
      name, image, //files, mediaType, description, 
      hat, body, eyes, mouth, clothes, accessory, background
    }
  } = rocker;

  return {
    name, image, 
    hat, body, eyes, mouth, clothes, accessory, background
  };
};

module.exports = transformRockerMeta;