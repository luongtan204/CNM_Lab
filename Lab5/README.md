
# HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY CHƯƠNG TRÌNH

Dự án này là một ứng dụng web Quản lý Sản phẩm sử dụng Node.js, Express, EJS, và các dịch vụ AWS (DynamoDB & S3). Dưới đây là các bước chi tiết để khởi chạy dự án trên máy tính cục bộ.

## 1. Yêu cầu hệ thống (Prerequisites)

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt sẵn:
- **Node.js**: Phiên bản 18.x trở lên (Dự án đang dùng Node v22.x). Có thể tải tại `https://nodejs.org/`.
- **Tài khoản AWS**: Có sẵn thông tin xác thực AWS (`Access Key ID` và `Secret Access Key`) với quyền truy cập (mô phỏng quyền thêm/sửa/xóa) vào:
  - Một bảng **DynamoDB**.
  - Một bucket **S3** dùng để lưu trữ hình ảnh.

---

## 2. Cài đặt các thư viện (Install Dependencies)

Mở terminal (trên VS Code hoặc Command Prompt) tại thư mục chứa dự án:
```bash
# Di chuyển vào thư mục dự án
cd \đường_dẫn_tới_thư_mục_chứa_code\Lab5

# Cài đặt toàn bộ các thư viện cần thiết
npm install
```

---

## 3. Cấu hình biến môi trường (Environment Variables)

Hệ thống cần các thông tin AWS để kết nối CSDL và lưu trữ. Tạo một file tên là `.env` nằm ở **cùng cấp với thư mục gốc của dự án (ngang hàng với `package.json`)**.
Nội dung file `.env` cần chuẩn bị như sau:

```env
# Port chạy Server (mặc định 3000)
PORT=3000

# Thông tin xác thực AWS (Lấy từ AWS IAM)
AWS_ACCESS_KEY_ID=thay_bang_access_key_cua_ban
AWS_SECRET_ACCESS_KEY=thay_bang_secret_key_cua_ban
AWS_REGION=ap-southeast-1

# Cấu hình tài nguyên AWS
S3_BUCKET_NAME=ten_bucket_s3_cua_ban
DYNAMODB_TABLE_NAME=Products
```
*Lưu ý: Bảng DynamoDB (ở ví dụ này là `Products`) phải được tạo sẵn với Partition Key là `ID` (Kiểu chuỗi - String).*

---

## 4. Khởi chạy Server

Khi đã cài đặt đủ thư viện và cấu hình xong file `.env`, dùng lệnh sau để chạy chương trình:

```bash
npm start
```

Bạn sẽ thấy thông báo:
```text
Checking table 'Products'...
Table 'Products' exists.
Server running on http://localhost:3000
```
*(Nếu console báo lỗi màu đỏ `❌ LỖI NGHIÊM TRỌNG`, hãy kiểm tra lại tên bảng trong file .env xem đã khớp với bảng tạo trên trang chủ AWS chưa).*

---

## 5. Sử dụng ứng dụng

- **Mở trình duyệt web** (Chrome/Edge/Safari/Firefox).
- Truy cập vào địa chỉ: **http://localhost:3000**
- Giao diện danh sách Quản lý Sản phẩm sẽ hiện ra. Bạn có thể trực tiếp test các chức năng Thêm (kèm Hình ảnh), Sửa, Xóa và Tìm kiếm sản phẩm.
