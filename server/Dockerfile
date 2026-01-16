# Sử dụng Node.js LTS làm base image
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install --production

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Mở cổng cho ứng dụng
EXPOSE 5000

# Lệnh khởi chạy ứng dụng
CMD ["npm", "start"]
