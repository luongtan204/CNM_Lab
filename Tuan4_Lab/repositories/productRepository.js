const { ScanCommand, QueryCommand, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/aws');

function buildFilters({ includeDeleted, name, priceMin, priceMax }) {
  const filters = [];
  const names = {};
  const values = {};

  if (!includeDeleted) {
    filters.push('(attribute_not_exists(isDeleted) OR isDeleted = :falseFlag)');
    values[':falseFlag'] = false;
  }

  if (name) {
    filters.push('contains(#n, :name)');
    names['#n'] = 'name';
    values[':name'] = name;
  }

  if (priceMin !== undefined && priceMin !== null) {
    filters.push('price >= :priceMin');
    values[':priceMin'] = Number(priceMin);
  }

  if (priceMax !== undefined && priceMax !== null) {
    filters.push('price <= :priceMax');
    values[':priceMax'] = Number(priceMax);
  }

  return { filters, names, values };
}

async function list({ categoryId, name, priceMin, priceMax, includeDeleted = false, limit = 200, lastKey }) {
  const gsiName = process.env.PRODUCT_CATEGORY_GSI;
  const { filters, names, values } = buildFilters({ includeDeleted, name, priceMin, priceMax });

  const params = {
    TableName: TABLES.products,
    Limit: limit,
    ExclusiveStartKey: lastKey
  };

  if (categoryId && gsiName) {
    params.IndexName = gsiName;
    params.KeyConditionExpression = 'categoryId = :categoryId';
    params.ExpressionAttributeValues = { ...params.ExpressionAttributeValues, ':categoryId': categoryId, ...values };
  } else {
    if (categoryId) {
      filters.push('categoryId = :categoryId');
      values[':categoryId'] = categoryId;
    }
  }

  if (filters.length > 0) {
    params.FilterExpression = filters.join(' AND ');
    params.ExpressionAttributeValues = { ...params.ExpressionAttributeValues, ...values };
  }
  if (Object.keys(names).length > 0) {
    params.ExpressionAttributeNames = names;
  }

  const command = params.IndexName ? new QueryCommand(params) : new ScanCommand(params);
  const data = await docClient.send(command);
  return { items: data.Items || [], lastKey: data.LastEvaluatedKey || null, usedIndex: Boolean(params.IndexName) };
}

async function getById(id) {
  const command = new GetCommand({ TableName: TABLES.products, Key: { id } });
  const { Item } = await docClient.send(command);
  return Item || null;
}

async function create(product) {
  const command = new PutCommand({ TableName: TABLES.products, Item: product });
  await docClient.send(command);
  return product;
}

async function update(id, fields) {
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
    TableName: TABLES.products,
    Key: { id },
    UpdateExpression: `SET ${sets.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW'
  });

  const result = await docClient.send(command);
  return result.Attributes;
}

async function softDelete(id) {
  const command = new UpdateCommand({
    TableName: TABLES.products,
    Key: { id },
    UpdateExpression: 'SET isDeleted = :trueFlag, deletedAt = :now REMOVE url_image',
    ExpressionAttributeValues: {
      ':trueFlag': true,
      ':now': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  });
  const result = await docClient.send(command);
  return result.Attributes;
}

module.exports = {
  list,
  getById,
  create,
  update,
  softDelete
};
