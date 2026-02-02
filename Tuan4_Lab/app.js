const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { attachUser, consumeFlash } = require('./middlewares/authMiddleware');
const authService = require('./services/authService');

// Debug: confirm env vars loaded (remove in production)
console.log('S3_BUCKET=', process.env.S3_BUCKET);
console.log('AWS_REGION=', process.env.AWS_REGION);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(attachUser);
app.use(consumeFlash);

app.use(authRoutes);
app.use(productRoutes);
app.use(categoryRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

const port = process.env.PORT || 3000;
authService.ensureSeedUsers().catch((err) => console.error('Seed user error', err));

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

