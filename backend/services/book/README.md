# Book Service API Documentation

## Overview
Book Service quản lý toàn bộ sách trong thư viện với các chức năng CRUD, tìm kiếm và thống kê.

## Phân quyền
- **Reader**: Chỉ được xem sách
- **Staff/Librarian**: Xem, thêm, sửa sách
- **Admin/Librarian**: Full quyền (bao gồm xóa)

## API Endpoints

### 🔓 Public Routes (Không cần đăng nhập)

#### 1. Tìm kiếm sách
```http
GET /api/books/search?q=keyword&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": [
    {
      "_id": "...",
      "title": "Clean Code",
      "isbn": "9780132350884",
      "author": "Robert C. Martin",
      "available": 5,
      "quantity": 10
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 50, "pages": 5 }
}
```

#### 2. Sách có sẵn để mượn
```http
GET /api/books/available?page=1&limit=10
```

#### 3. Sách được mượn nhiều nhất
```http
GET /api/books/most-borrowed?limit=10
```

#### 4. Sách mới về
```http
GET /api/books/new-arrivals?limit=10
```

#### 5. Sách theo thể loại
```http
GET /api/books/category/Technology
```

#### 6. Sách theo tác giả
```http
GET /api/books/author/Robert Martin
```

### 🔐 Protected Routes (Yêu cầu đăng nhập)

**Header:**
```
Authorization: Bearer <token>
```

#### 7. Danh sách tất cả sách
```http
GET /api/books?page=1&limit=10&category=Technology&status=available
```

**Query Parameters:**
- `page` - Trang (default: 1)
- `limit` - Số sách/trang (default: 10)
- `category` - Lọc theo thể loại
- `status` - available, unavailable, maintenance, discontinued
- `language` - Vietnamese, English, etc.
- `author` - Lọc theo tác giả
- `publisher` - Lọc theo nhà xuất bản
- `available` - true/false (có sẵn để mượn)

#### 8. Chi tiết sách
```http
GET /api/books/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Book retrieved successfully",
  "data": {
    "_id": "...",
    "title": "Clean Code",
    "isbn": "9780132350884",
    "author": "Robert C. Martin",
    "publisher": "Prentice Hall",
    "publishYear": 2008,
    "category": "Technology",
    "language": "English",
    "pages": 464,
    "description": "A handbook of agile software craftsmanship",
    "quantity": 10,
    "available": 5,
    "borrowed": 5,
    "location": {
      "shelf": "A1",
      "row": "2",
      "position": "3"
    },
    "price": 500000,
    "status": "available",
    "tags": ["programming", "software", "best-practices"],
    "totalBorrowed": 145,
    "rating": {
      "average": 4.8,
      "count": 50
    },
    "addedBy": {
      "_id": "...",
      "fullName": "Admin User"
    }
  }
}
```

#### 9. Kiểm tra tồn kho
```http
GET /api/books/:id/availability
```

**Response:**
```json
{
  "success": true,
  "message": "Availability checked successfully",
  "data": {
    "isbn": "9780132350884",
    "title": "Clean Code",
    "quantity": 10,
    "available": 5,
    "borrowed": 5,
    "isAvailable": true,
    "status": "available"
  }
}
```

### 👔 Staff/Librarian Routes

#### 10. Thêm sách mới
```http
POST /api/books
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "title": "Clean Code",
  "isbn": "9780132350884",
  "author": "Robert C. Martin",
  "publisher": "Prentice Hall",
  "publishYear": 2008,
  "category": "Technology",
  "language": "English",
  "pages": 464,
  "description": "A handbook of agile software craftsmanship",
  "quantity": 10,
  "location": {
    "shelf": "A1",
    "row": "2",
    "position": "3"
  },
  "price": 500000,
  "tags": ["programming", "software"]
}
```

#### 11. Cập nhật sách
```http
PUT /api/books/:id
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "title": "Clean Code - Updated Edition",
  "quantity": 15,
  "price": 550000
}
```

#### 12. Cập nhật số lượng
```http
PATCH /api/books/:id/quantity
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "quantity": 20
}
```

#### 13. Thống kê sách
```http
GET /api/books/stats/overview
Authorization: Bearer <staff_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "overall": {
      "totalBooks": 5000,
      "availableBooks": 3200,
      "borrowedBooks": 1800,
      "totalTitles": 1500
    },
    "byCategory": [
      {
        "_id": "Technology",
        "count": 350,
        "totalQuantity": 1200,
        "available": 800
      },
      {
        "_id": "Literature",
        "count": 280,
        "totalQuantity": 950,
        "available": 600
      }
    ]
  }
}
```

### 🔴 Admin/Librarian Only

#### 14. Xóa sách
```http
DELETE /api/books/:id
Authorization: Bearer <admin_token>
```

**Note:** Không thể xóa sách đang được mượn

## Book Categories

- Fiction
- Non-Fiction
- Science
- Technology
- History
- Biography
- Literature
- Philosophy
- Education
- Children
- Comic
- Reference
- Other

## Book Status

- **available**: Có sẵn để mượn
- **unavailable**: Hết sách
- **maintenance**: Đang bảo trì
- **discontinued**: Ngừng lưu hành

## Languages Supported

- Vietnamese
- English
- French
- Chinese
- Japanese
- Korean
- Other

## Business Rules

1. **ISBN**: Phải unique, 10 hoặc 13 chữ số
2. **Quantity**: `available + borrowed = quantity`
3. **Deletion**: Không được xóa sách đang có người mượn
4. **Available**: Tự động cập nhật khi mượn/trả
5. **Status**: Tự động set `unavailable` khi `available = 0`

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token)
- `403` - Forbidden (insufficient permissions)
- `404` - Book not found
- `500` - Server Error

## Example Usage

### Tạo sách với cURL
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Pragmatic Programmer",
    "isbn": "9780135957059",
    "author": "David Thomas, Andrew Hunt",
    "publisher": "Addison-Wesley",
    "publishYear": 2019,
    "category": "Technology",
    "language": "English",
    "pages": 352,
    "quantity": 8,
    "price": 480000
  }'
```

### Tìm kiếm sách
```bash
curl http://localhost:5000/api/books/search?q=programming&limit=5
```
