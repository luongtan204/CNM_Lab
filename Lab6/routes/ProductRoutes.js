const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const upload = require('../middlewares/upload');

router.get('/', productController.getAllProducts);
router.get('/add', productController.getAddForm);
router.post('/add', upload.single('image'), productController.addProduct);
router.get('/detail/:id', productController.getProductDetail);
router.get('/edit/:id', productController.getEditForm);
router.post('/edit/:id', upload.single('image'), productController.updateProduct);
router.post('/delete/:id', productController.deleteProduct);

module.exports = router;
