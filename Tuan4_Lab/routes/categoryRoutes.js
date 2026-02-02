const express = require('express');
const { requireAuth, requireRoles } = require('../middlewares/authMiddleware');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

router.get('/categories', requireAuth, categoryController.listPage);
router.get('/categories/new', requireAuth, requireRoles(['admin']), categoryController.renderNew);
router.get('/categories/:id/edit', requireAuth, requireRoles(['admin']), categoryController.renderEdit);
router.post('/categories', requireAuth, requireRoles(['admin']), categoryController.create);
router.put('/categories/:id', requireAuth, requireRoles(['admin']), categoryController.update);
router.delete('/categories/:id', requireAuth, requireRoles(['admin']), categoryController.remove);

module.exports = router;
