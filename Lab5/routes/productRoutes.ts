import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { upload } from '../config/awsConfig.js';

const router = Router();

router.get('/', productController.index);
router.get('/add', productController.renderAdd);
router.post('/add', upload.single('image'), productController.add);
router.get('/edit/:id', productController.renderEdit);
router.put('/edit/:id', upload.single('image'), productController.edit);
router.delete('/delete/:id', productController.delete);

export default router;
