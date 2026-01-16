# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN GENERATE_SOURCEMAP=false npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Sao chép file cấu hình nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép file build từ stage 1 vào nginx
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
