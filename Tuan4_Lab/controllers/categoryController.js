const categoryService = require('../services/categoryService');

async function listPage(req, res) {
  const categories = await categoryService.listCategories();
  res.render('categories/index', { categories });
}

function renderNew(req, res) {
  res.render('categories/form', { category: null, mode: 'create' });
}

async function renderEdit(req, res) {
  const { id } = req.params;
  const category = await categoryService.getCategory(id);
  if (!category) {
    return res.status(404).send('Category not found');
  }
  res.render('categories/form', { category, mode: 'edit' });
}

async function create(req, res) {
  try {
    await categoryService.createCategory({
      name: req.body.name,
      description: req.body.description
    });
    req.session.flash = { type: 'success', message: 'Đã tạo danh mục.' };
    res.redirect('/categories');
  } catch (err) {
    console.error('Create category error', err);
    req.session.flash = { type: 'error', message: 'Không tạo được danh mục.' };
    res.redirect('/categories/new');
  }
}

async function update(req, res) {
  const { id } = req.params;
  try {
    await categoryService.updateCategory(id, {
      name: req.body.name,
      description: req.body.description
    });
    req.session.flash = { type: 'success', message: 'Đã cập nhật danh mục.' };
    res.redirect('/categories');
  } catch (err) {
    console.error('Update category error', err);
    req.session.flash = { type: 'error', message: 'Không cập nhật được danh mục.' };
    res.redirect(`/categories/${id}/edit`);
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    await categoryService.deleteCategory(id);
    req.session.flash = { type: 'success', message: 'Đã xoá danh mục (sản phẩm giữ nguyên).' };
  } catch (err) {
    console.error('Delete category error', err);
    req.session.flash = { type: 'error', message: 'Không xoá được danh mục.' };
  }
  res.redirect('/categories');
}

module.exports = { listPage, renderNew, renderEdit, create, update, remove };
