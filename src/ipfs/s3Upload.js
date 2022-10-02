const { HeadObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Upload = async ({ s3, Bucket, Key, Body }) => {
  try {
    const params = new HeadObjectCommand({ Bucket, Key });
    await s3.send(params);
    console.log(`File ${Key} already exists.`);
  } catch (err) {
    if (err.name === 'NotFound') {
      const uploadParams = new PutObjectCommand({
        Bucket, Key, Body,
        ACL: 'public-read',
      });
      await s3.send(uploadParams);
    } else {
      console.log('Something went wrong', err);
    }
  }
};

module.exports = s3Upload;