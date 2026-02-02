const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/aws');

async function createLog(log) {
  const command = new PutCommand({ TableName: TABLES.productLogs, Item: log });
  await docClient.send(command);
  return log;
}

module.exports = { createLog };
