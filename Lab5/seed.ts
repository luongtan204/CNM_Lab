import 'dotenv/config';
import { ProductModel, Product } from './models/productModel.js';
import crypto from 'crypto';

const seedData = async () => {
    try {
        console.log("Bắt đầu tạo dữ liệu mẫu...");
        for (let i = 1; i <= 20; i++) {
            const product: Product = {
                ID: crypto.randomUUID(),
                name: `Sản phẩm Test ${i} - ${crypto.randomBytes(3).toString('hex')}`,
                price: Math.floor(Math.random() * 100000) + 10000,
                quantity: Math.floor(Math.random() * 50) + 1,
                image: '' // Không có ảnh để test ảnh mặc định luôn
            };
            
            await ProductModel.create(product);
            console.log(`Đã thêm sản phẩm ${i}/20: ${product.name}`);
        }
        console.log("\n✅ Hoàn tất việc bơm dữ liệu!");
    } catch (e) {
        console.error("❌ Lỗi khi tải dữ liệu:", e);
    }
}

seedData();
