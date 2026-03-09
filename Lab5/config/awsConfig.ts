import 'dotenv/config'; // Load env vars immediately to handle ESM hoisting
import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

// AWS Configuration
const region = process.env.AWS_REGION || 'ap-southeast-1';
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
};

if (!process.env.AWS_ACCESS_KEY_ID) {
    console.warn("Warning: AWS_ACCESS_KEY_ID is missing from environment variables.");
}

// S3 Client
export const s3Client = new S3Client({
  region,
  credentials: credentials.accessKeyId ? credentials : undefined,
});

// DynamoDB Client
export const ddbClient = new DynamoDBClient({
  region,
  credentials: credentials.accessKeyId ? credentials : undefined,
});

export const docClient = DynamoDBDocumentClient.from(ddbClient);

// Multer S3 Upload Configuration
export const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME || 'my-bucket',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'products/' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
