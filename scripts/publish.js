const s3 = require('s3');
const path = require('path');
const AWS = require('aws-sdk');

const client = s3.createClient({
  multipartUploadThreshhold: 1000000000,
  multipartUploadSize: 1000000000
});

const cloudfront = new AWS.CloudFront({apiVersion: '2019-03-26'});

const cdnInvalidations = () => new Promise((resolve, reject) => {
  const invalidationParams = {
    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: String(new Date().getTime()),
      Paths: {
        Quantity: 4,
        Items: [
          '/',
          '/css/*',
          '/index.html',
          '/feed.rss'
        ]
      }
    }
  };
  cloudfront.createInvalidation(invalidationParams, err => {
    if(err) reject(err);
    else resolve();
  });
});

const params = {
  localDir: path.resolve(__dirname, '..', 'dist'),
  deleteRemoved: true,
  s3Params: {
    Bucket: process.env.S3_BUCKET,
    // prefix: '/',
    ACL: 'public-read'
  }
};
const uploader = client.uploadDir(params);
uploader.on('error', console.error);
uploader.on('progress', () => {
  console.log('progress', uploader.progressAmount, uploader.progressTotal);
});
uploader.on('end', () => {
  cdnInvalidations()
    .then(() => {
      console.log('Done!');
    })
    .catch(console.error);
});
