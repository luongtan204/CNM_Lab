const path = require('path');
const express = require('express');
const multer = require('multer');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const REGION = process.env.AWS_REGION;
const TABLE_NAME = process.env.DYNAMO_TABLE || 'Products';
const BUCKET = process.env.S3_BUCKET;

const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});
const s3Client = new S3Client({ region: REGION });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

// List products
app.get('/', async (req, res) => {
  try {
    const data = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = data.Items || [];
    res.render('index', { products: items });
  } catch (err) {
    res.status(500).send('Failed to load products. Check server logs.');
    console.error('Scan error', err);
  }
});

// New product form
app.get('/products/new', (req, res) => {
  res.render('new');
});

// Create product
app.post('/products', upload.single('image'), async (req, res) => {
  const { name, price, quantity } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).send('Name, price, and quantity are required.');
  }

  try {
    const id = uuidv4();
    const parsedPrice = Number(price);
    const parsedQty = Number(quantity);

    const imageUrl = await uploadToS3IfPresent(req.file, id);

    const item = {
      id,
      name,
      price: parsedPrice,
      quantity: parsedQty,
      url_image: imageUrl || null
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Failed to create product.');
    console.error('Create error', err);
  }
});

// Edit form
app.get('/products/:id/edit', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
    if (!result.Item) {
      return res.status(404).send('Product not found');
    }
    res.render('edit', { product: result.Item });
  } catch (err) {
    res.status(500).send('Failed to load product.');
    console.error('Get error', err);
  }
});

// Update
app.put('/products/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).send('Name, price, and quantity are required.');
  }

  try {
    const parsedPrice = Number(price);
    const parsedQty = Number(quantity);

    const existing = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
    if (!existing.Item) {
      return res.status(404).send('Product not found');
    }

    let imageUrl = existing.Item.url_image || null;
    if (req.file) {
      // Optionally delete previous image
      if (imageUrl) {
        await deleteFromS3IfPossible(imageUrl);
      }
      imageUrl = await uploadToS3IfPresent(req.file, id);
    }

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #n = :name, price = :price, quantity = :qty, url_image = :img',
      ExpressionAttributeNames: { '#n': 'name' },
      ExpressionAttributeValues: {
        ':name': name,
        ':price': parsedPrice,
        ':qty': parsedQty,
        ':img': imageUrl
      }
    }));

    res.redirect('/');
  } catch (err) {
    res.status(500).send('Failed to update product.');
    console.error('Update error', err);
  }
});

// Delete
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
    const item = result.Item;

    await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));

    if (item && item.url_image) {
      await deleteFromS3IfPossible(item.url_image);
    }

    res.redirect('/');
  } catch (err) {
    res.status(500).send('Failed to delete product.');
    console.error('Delete error', err);
  }
});

// Upload helper
async function uploadToS3IfPresent(file, id) {
  if (!file) return null;
  if (!BUCKET) throw new Error('Missing S3_BUCKET env var');

  const extension = path.extname(file.originalname) || '.jpg';
  const key = `products/${id}${extension}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });
  await s3Client.send(command);

  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  return url;
}

async function deleteFromS3IfPossible(imageUrl) {
  if (!BUCKET || !imageUrl) return;
  try {
    const key = extractKeyFromUrl(imageUrl);
    if (!key) return;
    const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
    await s3Client.send(command);
  } catch (err) {
    console.warn('S3 delete skipped', err.message);
  }
}

function extractKeyFromUrl(imageUrl) {
  try {
    const url = new URL(imageUrl);
    return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
  } catch (err) {
    return null;
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
