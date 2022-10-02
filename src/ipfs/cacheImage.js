const fetchImage = require('./fetchImage');
const resizeImages = require('./resizeImages');
const s3Exists = require('./s3Exists');
const s3Upload = require('./s3Upload');

const cacheImage = async ({ipfsHash, extension, sizes, s3, bucket, path}) => {
  try {
    const originalKey = `${path}/${ipfsHash}.${extension}`;
    if (await s3Exists({s3, Bucket: bucket, Key: originalKey})) {
      console.log('Key exists, exiting early.');
      return;
    }

    const original = await fetchImage({ipfsHash});
    const resized = await resizeImages({ original, extension, sizes });

    await s3Upload({ s3, Bucket: bucket, Key: originalKey, Body: original });
    for (const image of resized) {
      const { name, data } = image;
      await s3Upload({ s3, Bucket: bucket, Key: `${path}/${ipfsHash}/${name}`, Body: data });
    }
  } catch (err) {
    console.log(`Error caching image ${ipfsHash}`, err);
  }
};

module.exports = cacheImage;