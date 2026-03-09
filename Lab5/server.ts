import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

import expressLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import productRoutes from './routes/productRoutes.js';
import { ensureTableExists } from './utils/dbSetup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// EJS setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Routes
app.use('/', productRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Đã xảy ra lỗi hệ thống.', error: err });
});

app.listen(PORT, async () => {
  await ensureTableExists();
  console.log(`Server running on http://localhost:${PORT}`);
});
