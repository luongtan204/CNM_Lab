const productService = require('../services/productService');
const categoryService = require('../services/categoryService');

const PAGE_SIZE = 6;

async function listPage(req, res) {
  const { categoryId, q, priceMin, priceMax, page = 1 } = req.query;
  const priceMinNumber = priceMin ? Number(priceMin) : undefined;
  const priceMaxNumber = priceMax ? Number(priceMax) : undefined;
  const filters = {
    categoryId: categoryId || undefined,
    name: q || undefined,
    priceMin: Number.isFinite(priceMinNumber) ? priceMinNumber : undefined,
    priceMax: Number.isFinite(priceMaxNumber) ? priceMaxNumber : undefined,
    includeDeleted: false
  };

  const { items, usedIndex } = await productService.listProducts(filters);
  const currentPage = Math.max(1, Number(page) || 1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const products = items.slice(start, start + PAGE_SIZE);
  const categories = await categoryService.listCategories();

  const baseParams = new URLSearchParams();
  if (categoryId) baseParams.append('categoryId', categoryId);
  if (q) baseParams.append('q', q);
  if (priceMin) baseParams.append('priceMin', priceMin);
  if (priceMax) baseParams.append('priceMax', priceMax);

  const prevParams = new URLSearchParams(baseParams);
  prevParams.set('page', Math.max(1, currentPage - 1));
  const nextParams = new URLSearchParams(baseParams);
  nextParams.set('page', Math.min(totalPages, currentPage + 1));

  res.render('index', {
    products,
    categories,
    filters: { categoryId, q, priceMin, priceMax },
    pagination: { currentPage, totalPages, prevQuery: prevParams.toString(), nextQuery: nextParams.toString() },
    usedIndex
  });
}

async function renderNew(req, res) {
  const categories = await categoryService.listCategories();
  res.render('new', { categories });
}

async function renderEdit(req, res) {
  const { id } = req.params;
  const product = await productService.getProduct(id);
  if (!product || product.isDeleted) {
    return res.status(404).send('Product not found');
  }
  const categories = await categoryService.listCategories();
  res.render('edit', { product, categories });
}

async function create(req, res) {
  try {
   
    await productService.createProduct({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      categoryId: req.body.categoryId || null,
      file: req.file,
      userId: req.session.user?.userId
    });
    req.session.flash = { type: 'success', message: 'Đã thêm sản phẩm.' };
    res.redirect('/');
  } catch (err) {
    console.error('Create error', err);
    req.session.flash = { type: 'error', message: err.message || 'Không tạo được sản phẩm.' };
    res.redirect('/products/new');
  }
}

async function update(req, res) {
  const { id } = req.params;
  try {
    await productService.updateProduct(id, {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      categoryId: req.body.categoryId || null,
      file: req.file,
      userId: req.session.user?.userId
    });
    req.session.flash = { type: 'success', message: 'Đã cập nhật sản phẩm.' };
    res.redirect('/');
  } catch (err) {
    console.error('Update error', err);
    req.session.flash = { type: 'error', message: err.message || 'Không cập nhật được sản phẩm.' };
    res.redirect(`/products/${id}/edit`);
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    await productService.deleteProduct(id, req.session.user?.userId);
    req.session.flash = { type: 'success', message: 'Đã xoá (soft delete) sản phẩm.' };
    res.redirect('/');
  } catch (err) {
    console.error('Delete error', err);
    req.session.flash = { type: 'error', message: err.message || 'Không xoá được sản phẩm.' };
    res.redirect('/');
  }
}

module.exports = { listPage, renderNew, renderEdit, create, update, remove };
