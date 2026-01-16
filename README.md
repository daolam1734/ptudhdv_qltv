# iLibrary - Hệ thống Quản lý Thư viện Thông minh 

Hệ thống quản lý thư viện hiện đại được xây dựng với kiến trúc Full-stack (React/Node.js), hỗ trợ đầy đủ các nghiệp vụ từ tìm kiếm sách, quản lý mượn trả đến báo cáo thống kê chuyên sâu.

##  Kiến trúc Hệ thống

Dự án được tổ chức theo mô hình **MVC (Model-View-Controller)** kết hợp với **Repository Pattern** ở phía Backend để đảm bảo tính module hóa và dễ bảo trì.

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Recharts (Data Visualization).
- **Backend**: Node.js, Express, MongoDB (Mongoose), Swagger UI (API Docs).
- **Architecture**: Repository -> Service -> Controller -> Routes.

---

##  Tính năng Chính

###  Dành cho Độc giả
- **Tra cứu sách**: Tìm kiếm sách thông minh theo tên, tác giả, ISBN hoặc thể loại.
- **Yêu cầu mượn**: Đặt chỗ (Reserve) sách trực tuyến trước khi đến thư viện.
- **Lịch sử cá nhân**: Theo dõi danh sách sách đang mượn, lịch sử trả và các khoản phí phạt.
- **Yêu thích**: Lưu trữ danh sách sách yêu thích để đọc sau.

###  Dành cho Thủ thư (Librarian)
- **Quy trình lưu thông tối ưu**:
    - Phê duyệt yêu cầu mượn (Chờ lấy sách).
    - Phát sách (Bắt đầu tính thời hạn mượn).
    - Thu hồi & Gia hạn sách.
- **Xử lý hư hỏng & Phí phạt**: Phân loại mức độ hư hỏng (Nhẹ/Nặng/Mất) và tự động tính phạt kèm phí quá hạn.
- **Báo cáo vận hành**: Dashboard trực quan về xu hướng mượn sách, sách quá hạn và thống kê tài chính.
- **Quản trị danh mục**: Quản lý linh hoạt hệ thống thể loại sách.

###  Dành cho Quản trị viên (Admin)
- **Quản lý nhân sự**: Cấp tài khoản và quản lý thông tin thủ thư.
- **Quản lý độc giả**: Kiểm soát trạng thái thẻ (Hoạt động/Đình chỉ do quá hạn).
- **Thống kê tổng quát**: Theo dõi toàn bộ hiệu năng và dữ liệu của thư viện.

---

##  Hướng dẫn Cài đặt

### 1. Backend (Server)
```bash
cd server
npm install
# Cấu hình file .env dựa trên .env.example
npm run dev
```

### 2. Frontend (Client)
```bash
cd client
npm install
npm start
```

---

##  Cấu hình Môi trường (.env)

**Backend:**
- `MONGODB_URI`: Đường dẫn kết nối MongoDB Atlas/Local.
- `JWT_SECRET`: Khóa bí mật cho xác thực JWT.
- `PORT`: Cổng chạy server (Mặc định 5000).

**Frontend:**
- `REACT_APP_API_URL`: URL của Backend API.

---

##  API Documentation
Hệ thống tích hợp Swagger UI để kiểm thử và tra cứu API:
`http://localhost:5000/api-docs`

---

##  Cấu trúc Thư mục
```
ptudhdv_qltv/
 client/              # React Frontend
    src/
       components/  # Shared UI components
       layouts/     # Admin/Staff/Reader Layouts
       pages/       # Page components (Role based)
       services/    # API calling layer
       context/     # Auth & State management

 server/              # Node.js Backend
     src/
        models/      # Mongoose Schemas
        repositories/# Direct DB operations
        services/    # Business logic layer
        controllers/ # request/response handling
        routes/      # Endpoint definitions