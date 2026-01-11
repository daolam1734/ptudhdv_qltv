# Borrow Service API Documentation

## Overview
Borrow Service quản lý quy trình mượn và trả sách, xử lý logic về hạn trả, tiền phạt và cập nhật trạng thái kho sách/độc giả.

## API Endpoints

### 🔐 Protected Routes (Staff/Admin)

#### 1. Mượn sách mới
`POST /api/borrow`
```json
{
  "readerId": "ID_DOC_GIA",
  "bookId": "ID_SACH",
  "durationDays": 14
}
```

#### 2. Trả sách
`POST /api/borrow/return/:id`
```json
{
  "notes": "Sách hơi cũ"
}
```

#### 3. Lấy tất cả bản ghi mượn
`GET /api/borrow/all?status=borrowed`

### 🔓 Shared Routes

#### 4. Lấy lịch sử mượn của độc giả
`GET /api/borrow/reader/:readerId`
- Reader chỉ có thể xem lịch sử của chính mình.

## Business Logic
1. **Mượn sách**: 
   - Kiểm tra độc giả có bị khóa không?
   - Kiểm tra độc giả đã mượn quá giới hạn chưa? (Mặc định 5 cuốn).
   - Kiểm tra sách còn trong kho không?
   - Giảm `available` của sách, tăng `borrowed`.
   - Cập nhật số lượng đang mượn của độc giả.
2. **Trả sách**:
   - Tính toán tiền phạt nếu trả quá `dueDate` (5000 VND / ngày).
   - Tăng `available` của sách, giảm `borrowed`.
   - Giảm số lượng đang mượn của độc giả.
