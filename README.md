<<<<<<< HEAD
# MMO Store Backend API

Backend API cho dự án tạp hóa MMO sử dụng Node.js, Express và MongoDB.

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- MongoDB >= 4.0
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Cấu hình môi trường
Tạo file `.env` trong thư mục backend:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mmo-store

# JWT Configuration
JWT_SECRET=mmo_store_jwt_secret_key_2024
JWT_EXPIRES_IN=7d

# Admin Configuration
ADMIN_EMAIL=admin@mmo-store.com
ADMIN_PASSWORD=admin123

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### Chạy server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📁 Cấu trúc thư mục

```
backend/
├── config/
│   └── database.js          # Kết nối MongoDB
├── controllers/
│   ├── authController.js    # Xử lý authentication
│   ├── productController.js # Xử lý sản phẩm
│   ├── categoryController.js# Xử lý danh mục
│   └── orderController.js   # Xử lý đơn hàng
├── models/
│   ├── User.js             # Model User
│   ├── Product.js          # Model Product
│   ├── Category.js         # Model Category
│   └── Order.js            # Model Order
├── routes/
│   ├── auth.js             # Routes authentication
│   ├── products.js         # Routes sản phẩm
│   ├── categories.js       # Routes danh mục
│   └── orders.js           # Routes đơn hàng
├── services/
│   ├── authService.js      # Logic authentication
│   ├── productService.js   # Logic sản phẩm
│   ├── categoryService.js  # Logic danh mục
│   └── orderService.js     # Logic đơn hàng
├── middlewares/
│   └── auth.js             # Middleware xác thực
├── uploads/                # Thư mục lưu file upload
├── server.js               # File chính khởi tạo server
├── package.json
└── README.md
```

## 🔐 Authentication

API sử dụng JWT (JSON Web Token) để xác thực. Đăng nhập để nhận token và sử dụng trong header:

```
Authorization: Bearer <your_jwt_token>
```

### Tài khoản Admin mặc định
- Email: `admin@mmo-store.com`
- Password: `admin123`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/logout` - Đăng xuất

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy sản phẩm theo ID
- `GET /api/products/slug/:slug` - Lấy sản phẩm theo slug
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)
- `GET /api/products/featured` - Sản phẩm nổi bật

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/:id` - Lấy danh mục theo ID
- `GET /api/categories/slug/:slug` - Lấy danh mục theo slug
- `POST /api/categories` - Tạo danh mục (Admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin)

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lấy danh sách đơn hàng (Admin)
- `GET /api/orders/user/:id` - Lấy đơn hàng của user
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (Admin)
- `POST /api/orders/:id/cancel` - Hủy đơn hàng

## 🛠 Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM cho MongoDB
- **JWT** - JSON Web Token cho authentication
- **bcryptjs** - Hash mật khẩu
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Security middleware
- **express-validator** - Validation middleware

## 🔒 Bảo mật

- JWT authentication
- Password hashing với bcrypt
- CORS protection
- Helmet security headers
- Input validation và sanitization
- Rate limiting (có thể thêm sau)

## 📝 Validation

API sử dụng express-validator để validate input data. Các lỗi validation sẽ được trả về dưới dạng:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "msg": "Email không hợp lệ",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## 🚦 Response Format

Tất cả API responses đều theo format chuẩn:

**Success Response:**
```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "errors": [...] // optional
}
```

## 🧪 Testing

```bash
# Chạy tests (sẽ thêm sau)
npm test
```

## 📧 Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên repository.
=======
# Backend_SHOP
>>>>>>> 261cf64d9d74138785fd240389a6be3cff5233c3
