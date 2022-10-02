const { HeadObjectCommand } = require("@aws-sdk/client-s3");
const s3Exists = async ({ s3, Bucket, Key }) => {
  try {
    const params = new HeadObjectCommand({ Bucket, Key });
    await s3.send(params);
    console.log(`File ${Key} already exists.`);
    return true;
  } catch (err) {
    if (err.name === 'NotFound') {
      return false
    } else {
      console.log('Something went wrong', err);
      throw err;
    }
  }
};

module.exports = s3Exists;