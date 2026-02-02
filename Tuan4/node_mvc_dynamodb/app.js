require('dotenv').config();
const express = require('express');
const path = require('path');

const productRoutes = require('./routes/productRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Quiet favicon requests (no icon provided)
app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.get('/', (_req, res) => res.redirect('/products'));
app.use('/products', productRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/products`);
});
