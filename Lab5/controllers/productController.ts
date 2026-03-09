import { Request, Response } from 'express';
import { ProductModel, Product } from '../models/productModel.js';
import { s3Client } from '../config/awsConfig.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export const productController = {
  async index(req: Request, res: Response) {
    try {
      const searchQuery = req.query.q as string;
      let products = await ProductModel.getAll();
      
      if (searchQuery) {
        products = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      
      res.render('products/index', { products, searchQuery });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.render('error', { message: 'Lỗi khi lấy danh sách sản phẩm. Vui lòng kiểm tra cấu hình AWS.', error });
    }
  },

  async renderAdd(req: Request, res: Response) {
    res.render('products/add', { error: null });
  },

  async add(req: Request, res: Response) {
    try {
      const { name, price, quantity } = req.body;
      const file = req.file as any;
      const ID = crypto.randomUUID();

      if (!name || !price || !quantity) {
        return res.render('products/add', { error: 'Vui lòng điền đầy đủ thông tin.' });
      }

      if (Number(price) <= 0) {
        return res.render('products/add', { error: 'Giá phải lớn hơn 0.' });
      }

      if (Number(quantity) < 0) {
        return res.render('products/add', { error: 'Số lượng không được âm.' });
      }

      if (!file) {
        return res.render('products/add', { error: 'Vui lòng chọn ảnh sản phẩm.' });
      }

      const newProduct: Product = {
        ID,
        name,
        price: Number(price),
        quantity: Number(quantity),
        image: file.location // URL from S3
      };

      await ProductModel.create(newProduct);
      res.redirect('/');
    } catch (error: any) {
      console.error('Error adding product:', error);
      res.render('products/add', { error: 'Thêm sản phẩm thất bại: ' + error.message });
    }
  },

  async renderEdit(req: Request, res: Response) {
    try {
      const product = await ProductModel.getById(req.params.id);
      if (!product) {
        return res.render('error', { message: 'Không tìm thấy sản phẩm.', error: null });
      }
      res.render('products/edit', { product, error: null });
    } catch (error: any) {
      console.error('Error fetching product for edit:', error);
      res.render('error', { message: 'Lỗi khi lấy thông tin sản phẩm.', error });
    }
  },

  async edit(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { name, price, quantity } = req.body;
      const file = req.file as any;

      if (!name || !price || !quantity) {
        const product = await ProductModel.getById(id);
        return res.render('products/edit', { product, error: 'Vui lòng điền đầy đủ thông tin.' });
      }

      if (Number(price) <= 0) {
        const product = await ProductModel.getById(id);
        return res.render('products/edit', { product, error: 'Giá phải lớn hơn 0.' });
      }

      if (Number(quantity) < 0) {
        const product = await ProductModel.getById(id);
        return res.render('products/edit', { product, error: 'Số lượng không được âm.' });
      }

      const updates: Partial<Product> = {
        name,
        price: Number(price),
        quantity: Number(quantity)
      };

      if (file) {
        updates.image = file.location;
        
        // Optional: Delete old image from S3
        const oldProduct = await ProductModel.getById(id);
        if (oldProduct && oldProduct.image) {
          try {
            const url = new URL(oldProduct.image);
            const key = url.pathname.substring(1); // Remove leading slash
            await s3Client.send(new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || 'my-bucket',
              Key: key
            }));
          } catch (e) {
            console.error('Failed to delete old image from S3:', e);
          }
        }
      }

      await ProductModel.update(id, updates);
      res.redirect('/');
    } catch (error: any) {
      console.error('Error updating product:', error);
      const product = await ProductModel.getById(req.params.id);
      res.render('products/edit', { product, error: 'Cập nhật sản phẩm thất bại: ' + error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const product = await ProductModel.getById(id);
      
      if (product && product.image) {
        try {
          const url = new URL(product.image);
          const key = url.pathname.substring(1);
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || 'my-bucket',
            Key: key
          }));
        } catch (e) {
          console.error('Failed to delete image from S3:', e);
        }
      }

      await ProductModel.delete(id);
      res.redirect('/');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.render('error', { message: 'Xóa sản phẩm thất bại.', error });
    }
  }
};
