import { CreateTableCommand, ListTablesCommand, DescribeTableCommand, CreateTableCommandInput } from '@aws-sdk/client-dynamodb';
import { ddbClient } from '../config/awsConfig.js';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'Products';

export async function ensureTableExists() {
  try {
    console.log(`Checking table '${TABLE_NAME}'...`);
    const listCommand = new ListTablesCommand({});
    const { TableNames } = await ddbClient.send(listCommand);

    if (TableNames?.includes(TABLE_NAME)) {
      console.log(`Table '${TABLE_NAME}' exists.`);
      return;
    }

    console.log(`Table '${TABLE_NAME}' not found. Creating...`);
    const params: CreateTableCommandInput = {
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'ID', KeyType: 'HASH' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'ID', AttributeType: 'S' },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };

    const createCommand = new CreateTableCommand(params);
    await ddbClient.send(createCommand);
    console.log(`Table '${TABLE_NAME}' creation initiated. Waiting for it to become ACTIVE...`);
    
    // Wait for table to be active
    const maxRetries = 20;
    for (let i = 0; i < maxRetries; i++) {
        await new Promise(r => setTimeout(r, 2000));
        try {
            const { Table } = await ddbClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
            if (Table?.TableStatus === 'ACTIVE') {
                console.log('Table is ACTIVE.');
                return;
            }
        } catch(e) {
            // Include helpful logging if describe fails
        }
        process.stdout.write('.');
    }
    console.log('\nTimed out waiting for table to become active.');

  } catch (err) {
    console.error('Error ensuring table exists:', err);
  }
}
