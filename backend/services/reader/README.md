# Reader Service API Documentation

## Overview
Reader Service quản lý hồ sơ độc giả, thông tin thẻ và lịch sử mượn trả.

## API Endpoints

### 🔐 Protected Routes (Yêu cầu đăng nhập)

#### 1. Lấy danh sách độc giả (Staff/Admin only)
`GET /api/readers?page=1&limit=10&status=active&membershipType=vip&search=nguyenvana`

#### 2. Lấy thông tin chi tiết
`GET /api/readers/:id`
- Cho phép Admin, Staff
- Cho phép Reader tự xem profile của mình

#### 3. Cập nhật thông tin hồ sơ
`PUT /api/readers/:id`
- Cho phép Admin, Staff
- Cho phép Reader tự cập nhật (ngoại trừ role, username, password)

#### 4. Xem lịch sử mượn
`GET /api/readers/:id/borrow-history`
- Lấy danh sách lịch sử mượn trả từ Borrow Service.

## Phân quyền (Authorization)
- **ADMIN/STAFF**: Toàn quyền quản lý danh sách độc giả.
- **READER**: Chỉ được thao tác trên chính hồ sơ của mã độc giả của mình.
