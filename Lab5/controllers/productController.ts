import { Request, Response } from 'express';
import { ProductModel, Product } from '../models/productModel.js';
import { s3Client } from '../config/awsConfig.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import fuzzysort from 'fuzzysort';

export const productController = {
  async index(req: Request, res: Response) {
    try {
      const searchQuery = req.query.q as string;
      const message = req.query.message as string;
      const errorMsg = req.query.error as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = 5;
      let products = await ProductModel.getAll();
      
      if (searchQuery) {
        const results = fuzzysort.go(searchQuery, products, { key: 'name' });
        products = results.map(res => res.obj);
      }
      
      const totalPages = Math.ceil(products.length / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);
      
      res.render('products/index', { 
        products: paginatedProducts, 
        searchQuery,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        message,
        error: errorMsg
      });
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

      const newProduct: Product = {
        ID,
        name,
        price: Number(price),
        quantity: Number(quantity),
        image: file ? file.location : '' // optional URL from S3
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
        return res.redirect(`/?error=${encodeURIComponent('Không tìm thấy sản phẩm.')}`);
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
      const product = await ProductModel.getById(id);
      
      if (!product) {
        return res.redirect(`/?error=${encodeURIComponent('Không tìm thấy sản phẩm để sửa.')}`);
      }

      const { name, price, quantity } = req.body;
      const file = req.file as any;

      if (!name || !price || !quantity) {
        return res.render('products/edit', { product, error: 'Vui lòng điền đầy đủ thông tin.' });
      }

      if (Number(price) <= 0) {
        return res.render('products/edit', { product, error: 'Giá phải lớn hơn 0.' });
      }

      if (Number(quantity) < 0) {
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
        if (product.image) {
          try {
            const url = new URL(product.image);
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
      const product = await ProductModel.getById(req.params.id).catch(() => null);
      if (product) {
        res.render('products/edit', { product, error: 'Cập nhật sản phẩm thất bại: ' + error.message });
      } else {
        res.redirect(`/?error=${encodeURIComponent('Cập nhật thất bại: Không tìm thấy sản phẩm.')}`);
      }
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const product = await ProductModel.getById(id);
      
      if (!product) {
        return res.redirect(`/?error=${encodeURIComponent('Không tìm thấy sản phẩm để xóa.')}`);
      }

      if (product.image) {
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
      const successMessage = product ? `Đã xóa thành công sản phẩm: ${product.name}` : 'Đã xóa sản phẩm thành công';
      res.redirect(`/?message=${encodeURIComponent(successMessage)}`);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.redirect(`/?error=${encodeURIComponent('Xóa sản phẩm thất bại: ' + error.message)}`);
    }
  }
};
