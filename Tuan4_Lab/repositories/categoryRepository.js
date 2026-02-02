const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/aws');

async function list() {
  const command = new ScanCommand({ TableName: TABLES.categories });
  const data = await docClient.send(command);
  return data.Items || [];
}

async function getById(categoryId) {
  const command = new GetCommand({ TableName: TABLES.categories, Key: { categoryId } });
  const { Item } = await docClient.send(command);
  return Item || null;
}

async function create(category) {
  const command = new PutCommand({ TableName: TABLES.categories, Item: category });
  await docClient.send(command);
  return category;
}

async function update(categoryId, fields) {
  const names = {};
  const values = { ':updatedAt': new Date().toISOString() };
  const sets = ['updatedAt = :updatedAt'];

  Object.entries(fields).forEach(([key, val]) => {
    if (val === undefined) return;
    const placeholder = `#${key}`;
    const valuePlaceholder = `:${key}`;
    names[placeholder] = key;
    values[valuePlaceholder] = val;
    sets.push(`${placeholder} = ${valuePlaceholder}`);
  });

  const command = new UpdateCommand({
    TableName: TABLES.categories,
    Key: { categoryId },
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW'
  });
  const result = await docClient.send(command);
  return result.Attributes;
}

async function remove(categoryId) {
  const command = new DeleteCommand({ TableName: TABLES.categories, Key: { categoryId } });
  await docClient.send(command);
}

module.exports = { list, getById, create, update, remove };
