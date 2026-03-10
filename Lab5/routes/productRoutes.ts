import { Router, Request, Response, NextFunction } from 'express';
import { productController } from '../controllers/productController.js';
import { upload } from '../config/awsConfig.js';
import { ProductModel } from '../models/productModel.js';

const router = Router();

// Middleware để bắt lỗi upload ảnh
const handleUpload = (view: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploader = upload.single('image');
    uploader(req, res, async (err: any) => {
      if (err) {
        console.error('Upload Error:', err);
        let product = null;
        if (view === 'products/edit' && req.params.id) {
          try {
            product = await ProductModel.getById(req.params.id);
          } catch (e) {
            console.error(e);
          }
        }
        return res.render(view, { error: 'Lỗi upload ảnh: ' + err.message, product });
      }
      next();
    });
  };
};

router.get('/', productController.index);
router.get('/add', productController.renderAdd);
router.post('/add', handleUpload('products/add'), productController.add);
router.get('/edit/:id', productController.renderEdit);
router.put('/edit/:id', handleUpload('products/edit'), productController.edit);
router.delete('/delete/:id', productController.delete);

export default router;
