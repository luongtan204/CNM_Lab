require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION || 'us-west-2';
const endpoint = process.env.DYNAMO_ENDPOINT || 'http://localhost:8000';
const tableName = process.env.TABLE_NAME || 'Products';

const client = new DynamoDBClient({ region, endpoint });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

module.exports = {
  docClient,
  TABLE_NAME: tableName,
};
