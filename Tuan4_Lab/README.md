# AWS Product Manager (Advanced)

CRUD sản phẩm với Node.js + Express + EJS, lưu dữ liệu ở DynamoDB và ảnh ở S3. Bản mở rộng này thêm phân quyền, danh mục, soft delete, lọc nâng cao và audit log.

## Kiến trúc & thư mục
- `app.js`: cấu hình Express, session, layout, route tổng.
- `controllers/`: xử lý request/response.
- `services/`: nghiệp vụ (upload S3, auth, soft delete, log).
- `repositories/`: thao tác DynamoDB (không viết trong route).
- `middlewares/`: auth, flash.
- `routes/`: tách route theo module.

## DynamoDB schema
- **Products** (PK: `id` string) — mở rộng: `name`, `price` (Number), `quantity` (Number), `categoryId`, `url_image`, `isDeleted` (Boolean), `createdAt`, `deletedAt`.
	- Soft delete: set `isDeleted=true`, `deletedAt` và gỡ ảnh trên S3. UI không hiển thị item đã xóa mềm.
	- Tùy chọn GSI `categoryId-index` để Query theo `categoryId` (set env `PRODUCT_CATEGORY_GSI`). Nếu không có GSI, code fallback Scan + filter.
- **Categories** (PK: `categoryId` string) — `name`, `description`, `createdAt`.
	- Business rule: xóa category **không** xóa sản phẩm; sản phẩm giữ categoryId cũ.
- **Users** (PK: `userId` string) — `username`, `password` (hash bcrypt), `role` (`admin`/`staff`), `createdAt`.
	- Admin quản lý sản phẩm/category; staff chỉ xem.
- **ProductLogs** (PK: `logId` string) — `productId`, `action` (CREATE/UPDATE/DELETE), `userId`, `time`.

> DynamoDB không join như SQL vì mỗi item được đọc độc lập qua key/GSI; không có query planner để kết hợp bảng. Thay vào đó dùng denormalization hoặc đọc nhiều bảng rồi merge trong app layer (ở đây map category name cho sản phẩm).

## Luồng chính
- **Đăng nhập**: POST `/login` → kiểm hash mật khẩu trong bảng Users → lưu session. Logout POST `/logout`.
- **Thêm sản phẩm**: upload ảnh lên S3 → lưu URL + dữ liệu vào Products → ghi ProductLogs (CREATE). Admin only.

## Query vs Scan (lọc nâng cao)
- **Query**: đọc theo key hoặc GSI; chi phí theo số item matching; dùng khi lọc theo `categoryId` nếu có GSI (`categoryId-index`).
- **Scan**: đọc toàn bộ partition; chi phí theo tổng item; tốn hơn khi bảng lớn. Dùng khi không có GSI hoặc cần filter tên/price tự do.
- UI hỗ trợ lọc theo category, khoảng giá, tìm tên (contains) và phân trang phía server (slice sau khi lấy danh sách lọc).

## Tính năng
- Session-based auth; phân quyền `admin`/`staff`.
- CRUD danh mục; chọn category khi thêm/sửa sản phẩm.
- Soft delete sản phẩm, không hiển thị `isDeleted=true`.
- Upload ảnh S3, xóa ảnh khi soft delete sản phẩm.
- Audit log ProductLogs cho CREATE/UPDATE/DELETE.
- Trạng thái tồn kho hiển thị badge: In stock / Low (<5) / Out of stock.
- Layout EJS với topbar, flash message.

## So sánh DynamoDB vs MySQL cho bài toán này
| Tiêu chí | DynamoDB | MySQL |
| --- | --- | --- |
| Mô hình | NoSQL key-value/Document | Quan hệ, join mạnh |
| Quy mô | Tự động scale, throughput theo RCU/WCU | Scale-out phức tạp, cần sharding/replica |
| Truy vấn | Nhanh theo key/GSI; hạn chế join | Join, aggregate mạnh; linh hoạt schema cố định |
| Chi phí | Trả theo request/throughput; Scan tốn kém nếu không tối ưu key | Trả theo compute/storage; truy vấn phức tạp OK |
| Phù hợp | Workload truy cập theo key, latency thấp, dữ liệu phi quan hệ | Quan hệ chặt chẽ, báo cáo phức tạp |

### Ưu / nhược NoSQL (DynamoDB) cho mini e-commerce mở rộng 2–3 bảng
- Ưu: scale lớn, latency thấp, đơn giản schema, tích hợp IAM, pay-per-request.
- Nhược: không join, cần thiết kế key cẩn thận, hạn chế query ad-hoc, Scan đắt nếu filter rộng.

## Cấu hình môi trường
Sao chép `.env.example` thành `.env` hoặc thiết lập biến môi trường / IAM Role trên EC2:
```
AWS_REGION=ap-southeast-1
DYNAMO_TABLE=Products
DYNAMO_CATEGORY_TABLE=Categories
DYNAMO_USER_TABLE=Users
DYNAMO_PRODUCT_LOG_TABLE=ProductLogs
PRODUCT_CATEGORY_GSI=categoryId-index   # Tùy chọn, nếu đã tạo GSI
S3_BUCKET=your-s3-bucket
PORT=3000
SESSION_SECRET=change-me
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123
```
IAM Role cần quyền DynamoDB (Get/Put/Update/Delete/Scan/Query) và S3 (PutObject/DeleteObject).

## Chạy ứng dụng
```bash
npm install
npm run dev   # hoặc npm start
```
Mở http://localhost:3000. Lần đầu app sẽ seed user admin từ biến môi trường.

## Lưu ý bảo mật & cloud
- Không hard-code access key/secret; dùng IAM Role trên EC2 hoặc env.
- Session secret đặt qua env; trên production nên dùng session store bên ngoài (DynamoDB/Redis) thay vì memory.
- Ảnh bị soft delete sẽ được xóa trên S3 để tránh rò chi phí lưu trữ.

