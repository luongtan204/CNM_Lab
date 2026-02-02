const { v4: uuidv4 } = require('uuid');
const categoryRepository = require('../repositories/categoryRepository');

async function listCategories() {
  const categories = await categoryRepository.list();
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

async function createCategory({ name, description }) {
  const category = {
    categoryId: uuidv4(),
    name,
    description,
    createdAt: new Date().toISOString()
  };
  await categoryRepository.create(category);
  return category;
}

async function updateCategory(categoryId, { name, description }) {
  return categoryRepository.update(categoryId, { name, description });
}

async function deleteCategory(categoryId) {
  await categoryRepository.remove(categoryId);
}

async function getCategory(categoryId) {
  return categoryRepository.getById(categoryId);
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory
};
