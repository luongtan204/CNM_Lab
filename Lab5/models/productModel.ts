import { docClient } from '../config/awsConfig.js';
import { ScanCommand, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'Products';

export interface Product {
  ID: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export const ProductModel = {
  async getAll(): Promise<Product[]> {
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const response = await docClient.send(command);
    return (response.Items as Product[]) || [];
  },

  async getById(id: string): Promise<Product | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { ID: id }
    });
    const response = await docClient.send(command);
    return (response.Item as Product) || null;
  },

  async create(product: Product): Promise<void> {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: product
    });
    await docClient.send(command);
  },

  async update(id: string, updates: Partial<Product>): Promise<void> {
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (updates.name) {
      updateExpressionParts.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = updates.name;
    }
    if (updates.price !== undefined) {
      updateExpressionParts.push('#price = :price');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':price'] = updates.price;
    }
    if (updates.quantity !== undefined) {
      updateExpressionParts.push('#quantity = :quantity');
      expressionAttributeNames['#quantity'] = 'quantity';
      expressionAttributeValues[':quantity'] = updates.quantity;
    }
    if (updates.image) {
      updateExpressionParts.push('#image = :image');
      expressionAttributeNames['#image'] = 'image';
      expressionAttributeValues[':image'] = updates.image;
    }

    if (updateExpressionParts.length === 0) return;

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { ID: id },
      UpdateExpression: 'SET ' + updateExpressionParts.join(', '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    });

    await docClient.send(command);
  },

  async delete(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { ID: id }
    });
    await docClient.send(command);
  }
};
