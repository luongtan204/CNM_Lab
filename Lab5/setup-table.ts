import { CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { ddbClient } from './config/awsConfig.js'; // Note the .js extension for ESM
import dotenv from 'dotenv';

dotenv.config();

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'Products';

async function setupTable() {
  console.log(`Checking for table '${TABLE_NAME}' in ${await ddbClient.config.region()}...`);
  
  try {
    const listCommand = new ListTablesCommand({});
    const { TableNames } = await ddbClient.send(listCommand);

    if (TableNames?.includes(TABLE_NAME)) {
      console.log(`Table '${TABLE_NAME}' already exists.`);
      return;
    }

    console.log(`Table '${TABLE_NAME}' not found. Creating...`);

    const createCommand = new CreateTableCommand({
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'ID', KeyType: 'HASH' }, // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'ID', AttributeType: 'S' }, // String
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });

    await ddbClient.send(createCommand);
    console.log(`Table '${TABLE_NAME}' creation initiated. It may take a moment to become active.`);

  } catch (err) {
    console.error('Error setting up table:', err);
  }
}

setupTable();
