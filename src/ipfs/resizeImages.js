const sharp = require('sharp');

const resizeImages = async ({original, extension, sizes}) => {
  if (extension === 'png') {
    const images = await Promise.all(
      sizes.map((width) =>
        sharp(original)
          .clone()
          .resize({ width })
          .png()
          .toBuffer()
      )
    );
    return images.map((data, i) => ({
      name: `${sizes[i]}.${extension}`,
      data
    }));
  } else if (extension === 'jpg') {
    const images = await Promise.all(
      sizes.map((width) =>
        sharp(original)
          .clone()
          .resize({ width })
          .jpg({quality: 75})
          .toBuffer()
      )
    );
    return images.map((data, i) => ({
      name: `${sizes[i]}.${extension}`,
      data
    }));
  }
};

module.exports = resizeImages;