const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { client } = require('../config/db');

const params = {
    TableName: 'Products',
    KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' } // Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' } // String
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};

const createTable = async () => {
    try {
        const command = new CreateTableCommand(params);
        const data = await client.send(command);
        console.log("Success! Table created.", data);
    } catch (err) {
        if (err.name === 'ResourceInUseException') {
            console.log("Table 'Products' already exists.");
        } else {
            console.error("Error creating table", err);
        }
    }
};

createTable();
