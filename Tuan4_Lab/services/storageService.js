const path = require('path');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client, BUCKET, REGION } = require('../config/aws');

async function uploadProductImage(file, productId) {
  if (!file) return null;
  if (!BUCKET) throw new Error('Missing S3_BUCKET env variable');

  const extension = path.extname(file.originalname) || '.jpg';
  const key = `products/${productId}${extension}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });
  await s3Client.send(command);
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

function extractKeyFromUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
  } catch (_err) {
    return null;
  }
}

async function deleteImage(url) {
  if (!url || !BUCKET) return;
  const key = extractKeyFromUrl(url);
  if (!key) return;
  try {
    const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
    await s3Client.send(command);
  } catch (err) {
    console.warn('Skip S3 delete', err.message);
  }
}

module.exports = { uploadProductImage, deleteImage };
