const productModel = require('../models/productModel');

exports.list = async (_req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.render('index', { products });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).send('Failed to list products');
  }
};

exports.showNew = (_req, res) => {
  res.render('new');
};

exports.create = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    await productModel.createProduct({ ...req.body, imageUrl });
    res.redirect('/products');
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).send('Failed to create product');
  }
};

exports.showEdit = async (req, res) => {
  try {
    const product = await productModel.getProductById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('edit', { product });
  } catch (err) {
    console.error('Show edit error:', err);
    res.status(500).send('Failed to load product');
  }
};

exports.update = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    await productModel.updateProduct(req.params.id, { ...req.body, imageUrl });
    res.redirect('/products');
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).send('Failed to update product');
  }
};

exports.remove = async (req, res) => {
  try {
    await productModel.deleteProduct(req.params.id);
    res.redirect('/products');
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).send('Failed to delete product');
  }
};
