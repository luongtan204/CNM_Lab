const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');

const REGION = process.env.AWS_REGION;
const TABLES = {
  products: process.env.DYNAMO_TABLE || 'Products',
  categories: process.env.DYNAMO_CATEGORY_TABLE || 'Categories',
  users: process.env.DYNAMO_USER_TABLE || 'Users',
  productLogs: process.env.DYNAMO_PRODUCT_LOG_TABLE || 'ProductLogs'
};

const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true }
});

const s3Client = new S3Client({ region: REGION });

module.exports = {
  REGION,
  TABLES,
  BUCKET: process.env.S3_BUCKET,
  docClient,
  s3Client
};
