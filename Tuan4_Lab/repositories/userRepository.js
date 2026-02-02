const { ScanCommand, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/aws');

async function getByUsername(username) {
  const command = new ScanCommand({
    TableName: TABLES.users,
    FilterExpression: '#u = :username',
    ExpressionAttributeNames: { '#u': 'username' },
    ExpressionAttributeValues: { ':username': username }
  });
  const data = await docClient.send(command);
  return (data.Items || [])[0] || null;
}

async function getById(userId) {
  const command = new GetCommand({ TableName: TABLES.users, Key: { userId } });
  const { Item } = await docClient.send(command);
  return Item || null;
}

async function create(user) {
  const command = new PutCommand({ TableName: TABLES.users, Item: user });
  await docClient.send(command);
  return user;
}

module.exports = {
  getByUsername,
  getById,
  create
};
