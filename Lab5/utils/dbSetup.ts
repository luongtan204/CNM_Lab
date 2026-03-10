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

    throw new Error(`Bảng DynamoDB '${TABLE_NAME}' không tồn tại. Vui lòng kiểm tra lại cấu hình DYNAMODB_TABLE_NAME trong file .env!`);

  } catch (err: any) {
    if (err.name === 'ResourceNotFoundException' || err.message.includes('không tồn tại')) {
      console.error('\n❌ LỖI NGHIÊM TRỌNG:', err.message);
      console.error('👉 Hãy đảm bảo rằng bảng đã được tạo sẵn trên AWS DynamoDB hoặc sửa lại tên bảng trong file .env cho đúng.\n');

    } else {
      console.error('Lỗi khi kiểm tra bảng DynamoDB:', err);

    }
  }
}
