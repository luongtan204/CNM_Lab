const express = require('express');
const multer = require('multer');
const { requireAuth, requireRoles } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', requireAuth, productController.listPage);
router.get('/products/new', requireAuth, requireRoles(['admin']), productController.renderNew);
router.get('/products/:id/edit', requireAuth, requireRoles(['admin']), productController.renderEdit);
router.post('/products', requireAuth, requireRoles(['admin']), upload.single('image'), productController.create);
router.put('/products/:id', requireAuth, requireRoles(['admin']), upload.single('image'), productController.update);
router.delete('/products/:id', requireAuth, requireRoles(['admin']), productController.remove);

module.exports = router;
