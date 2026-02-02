const { v4: uuidv4 } = require('uuid');
const productRepository = require('../repositories/productRepository');
const categoryService = require('./categoryService');
const { uploadProductImage, deleteImage } = require('./storageService');
const productLogRepository = require('../repositories/productLogRepository');

function deriveInventoryStatus(quantity) {
  if (quantity <= 0) return 'out';
  if (quantity < 5) return 'low';
  return 'in';
}

async function listProducts(filters = {}) {
  const result = await productRepository.list(filters);
  const categories = await categoryService.listCategories();
  const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));

  const items = (result.items || []).map((item) => ({
    ...item,
    price: Number(item.price),
    quantity: Number(item.quantity),
    categoryName: categoryMap.get(item.categoryId) || 'Uncategorized',
    inventoryStatus: deriveInventoryStatus(Number(item.quantity || 0))
  }));

  return { ...result, items };
}

async function getProduct(id) {
  return productRepository.getById(id);
}

async function createProduct({ name, price, quantity, categoryId, file, userId }) {
  if (!name || price === undefined || quantity === undefined) {
    throw new Error('Name, price, and quantity are required');
  }

  if (categoryId) {
    const category = await categoryService.getCategory(categoryId);
    if (!category) throw new Error('Category not found');
  }

  const id = uuidv4();
  const parsedPrice = Number(price);
  const parsedQty = Number(quantity);
  const url_image = await uploadProductImage(file, id);

  const product = {
    id,
    name,
    price: parsedPrice,
    quantity: parsedQty,
    categoryId: categoryId || null,
    url_image: url_image || null,
    isDeleted: false,
    createdAt: new Date().toISOString()
  };

  await productRepository.create(product);
  await logAction({ productId: id, userId, action: 'CREATE' });
  return product;
}

async function updateProduct(id, { name, price, quantity, categoryId, file, userId }) {
  const existing = await productRepository.getById(id);
  if (!existing) throw new Error('Product not found');
  if (existing.isDeleted) throw new Error('Cannot update a deleted product');

  if (categoryId) {
    const category = await categoryService.getCategory(categoryId);
    if (!category) throw new Error('Category not found');
  }

  let imageUrl = existing.url_image;
  if (file) {
    if (imageUrl) await deleteImage(imageUrl);
    imageUrl = await uploadProductImage(file, id);
  }

  const updated = await productRepository.update(id, {
    name,
    price: Number(price),
    quantity: Number(quantity),
    categoryId: categoryId || null,
    url_image: imageUrl || null
  });

  await logAction({ productId: id, userId, action: 'UPDATE' });
  return updated;
}

async function deleteProduct(id, userId) {
  const existing = await productRepository.getById(id);
  if (!existing) throw new Error('Product not found');
  if (existing.isDeleted) return existing;

  await productRepository.softDelete(id);
  if (existing.url_image) {
    await deleteImage(existing.url_image);
  }
  await logAction({ productId: id, userId, action: 'DELETE' });
  return { ...existing, isDeleted: true };
}

async function logAction({ productId, userId, action }) {
  const log = {
    logId: uuidv4(),
    productId,
    action,
    userId,
    time: new Date().toISOString()
  };
  await productLogRepository.createLog(log);
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deriveInventoryStatus
};
