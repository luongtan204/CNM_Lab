# AWS Product Manager

CRUD sản phẩm với Node.js + Express + EJS, lưu dữ liệu ở DynamoDB và ảnh ở S3. Ứng dụng chạy tốt trên EC2 (ưu tiên dùng IAM Role cho quyền DynamoDB/S3).

## Yêu cầu
- Node.js 18+
- AWS tài khoản với DynamoDB table `Products` (PK: `id` string) và S3 bucket để chứa ảnh
- AWS Region: đặt qua biến môi trường `AWS_REGION`

## Cấu hình
1. Sao chép file `.env.example` thành `.env` (hoặc đặt biến môi trường trực tiếp / IAM Role trên EC2):
   - `AWS_REGION`
   - `DYNAMO_TABLE` (mặc định `Products`)
   - `S3_BUCKET`
   - `PORT` (tùy chọn)
2. Trên EC2, gán IAM Role có quyền tối thiểu: `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:Scan`, `s3:PutObject`, `s3:DeleteObject` cho bucket tương ứng.

## Chạy ứng dụng
```bash
npm install
npm run dev   # hoặc npm start
```
Mở http://localhost:3000.

## Triển khai EC2 nhanh gọn
- Cài Node: `curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo -E bash - && sudo yum install -y nodejs`
- Pull code (git hoặc upload), `npm install`, cấu hình biến môi trường (hoặc dùng `.env`).
- Chạy với `npm start` hoặc dùng PM2/systemd để chạy nền.
- Mở SG port 80/3000 theo nhu cầu.

## Chức năng
- Danh sách sản phẩm (Scan DynamoDB)
- Thêm sản phẩm: upload ảnh lên S3 (public-read), lưu URL vào DynamoDB
- Sửa sản phẩm: cập nhật trường và thay ảnh (xóa ảnh cũ trên S3 nếu có)
- Xóa sản phẩm: xóa item DynamoDB và (nếu có) ảnh S3

## Cấu trúc thư mục
- `app.js`: cấu hình Express, route CRUD, kết nối AWS SDK v3
- `views/`: EJS templates (`layout`, `index`, `new`, `edit`)
- `public/style.css`: giao diện
- `.env.example`: mẫu biến môi trường

## Ghi chú
- Form update/delete dùng method-override (`_method` hidden input).
- S3 key: `products/<uuid>.<ext>`.
- Nếu muốn giữ ảnh cũ khi cập nhật, bỏ đoạn xóa trong `app.js` hàm update/delete.
