const crypto = require('crypto');
const {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../config/dynamodb');

async function createProduct({ name, price, description, imageUrl }) {
  const product = {
    id: crypto.randomUUID(),
    name,
    price: Number(price) || 0,
    description,
    imageUrl,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: product,
    })
  );

  return product;
}

async function getAllProducts() {
  const data = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return data.Items || [];
}

async function getProductById(id) {
  const data = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return data.Item || null;
}

async function updateProduct(id, { name, price, description, imageUrl }) {
  const expressions = ['#name = :name', 'price = :price', 'description = :description'];
  const names = { '#name': 'name' };
  const values = {
    ':name': name,
    ':price': Number(price) || 0,
    ':description': description,
  };

  if (imageUrl !== undefined) {
    expressions.push('imageUrl = :imageUrl');
    values[':imageUrl'] = imageUrl;
  }

  const data = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'ALL_NEW',
    })
  );

  return data.Attributes;
}

async function deleteProduct(id) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConditionExpression: 'attribute_exists(id)',
    })
  );
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
