# Auth Service API Documentation

## Overview
Auth Service quản lý xác thực và phân quyền cho hệ thống quản lý thư viện.

## Roles (Phân quyền)
- **ADMIN**: Quản trị viên - Full quyền
- **LIBRARIAN**: Thủ thư - Quản lý sách và độc giả
- **STAFF**: Nhân viên - Thao tác cơ bản
- **READER**: Độc giả - Mượn/trả sách

## API Endpoints

### 🔓 Public Routes

#### 1. Đăng ký độc giả
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "reader01",
  "email": "reader@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "dateOfBirth": "2000-01-01",
  "idCard": "001234567890",
  "address": {
    "street": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "TP.HCM"
  },
  "membershipType": "basic"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reader registration successful",
  "data": {
    "user": {
      "_id": "...",
      "username": "reader01",
      "email": "reader@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "reader",
      "status": "active",
      "membershipType": "basic",
      "borrowLimit": 5
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "reader01",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "username": "reader01",
      "email": "reader@example.com",
      "role": "reader",
      "fullName": "Nguyễn Văn A"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 🔐 Protected Routes (Requires Authentication)

**Header:**
```
Authorization: Bearer <token>
```

#### 3. Lấy thông tin cá nhân
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "...",
    "username": "reader01",
    "email": "reader@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "reader",
    "membershipType": "basic",
    "currentBorrowCount": 2,
    "borrowLimit": 5
  }
}
```

#### 4. Cập nhật thông tin cá nhân
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Nguyễn Văn B",
  "phone": "0987654321",
  "address": {
    "street": "456 Đường XYZ",
    "city": "Hà Nội"
  }
}
```

#### 5. Đổi mật khẩu
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

### 👔 Admin Only Routes

#### 6. Đăng ký nhân viên
```http
POST /api/auth/staff/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "staff01",
  "email": "staff@example.com",
  "password": "password123",
  "fullName": "Trần Thị B",
  "phone": "0123456789",
  "role": "librarian",
  "dateOfBirth": "1990-01-01"
}
```

#### 7. Danh sách nhân viên
```http
GET /api/auth/staff?page=1&limit=10&role=librarian&status=active
Authorization: Bearer <admin_token>
```

#### 8. Danh sách độc giả
```http
GET /api/auth/readers?page=1&limit=10&status=active&membershipType=premium
Authorization: Bearer <staff_token>
```

## Membership Types

| Type    | Borrow Limit | Features |
|---------|--------------|----------|
| basic   | 5 books      | Standard |
| premium | 10 books     | Extended limit |
| vip     | 15 books     | Maximum limit + priority |

## Status

- **active**: Hoạt động bình thường
- **inactive**: Tạm ngừng
- **suspended**: Bị đình chỉ
- **expired**: Hết hạn thẻ

## Error Responses

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Detail 1", "Detail 2"]
}
```

## Security Features

✅ **Mật khẩu mã hóa**: Sử dụng bcryptjs (12 rounds)
✅ **JWT Token**: Expires sau 7 ngày
✅ **Role-based Access Control**: Middleware kiểm tra quyền
✅ **Password không trả về**: Tự động ẩn trong response
✅ **Membership validation**: Kiểm tra hạn thẻ khi login
