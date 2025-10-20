# Hướng dẫn khắc phục lỗi build frontend

Tài liệu này cung cấp thông tin về cách khắc phục các lỗi phổ biến khi build các ứng dụng frontend trong Docker.

## Lỗi khi build React app

### Lỗi "Fatal error: Check failed: CodeKindCanDeoptimize(code.kind())"

Lỗi này thường xảy ra khi Node.js không có đủ bộ nhớ để biên dịch ứng dụng React trong môi trường container. Các giải pháp đã được áp dụng:

1. Tăng bộ nhớ heap cho Node.js bằng cách thêm biến môi trường:
   ```dockerfile
   ENV NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. Thêm `CI=false` để React bỏ qua các warnings khi build:
   ```dockerfile
   RUN CI=false npm run build
   ```

### Lỗi về version của Node.js

Nếu vẫn gặp lỗi, có thể thử các giải pháp khác:

1. Sử dụng phiên bản Node.js khác:
   ```dockerfile
   FROM node:14-alpine as build
   ```
   hoặc
   ```dockerfile
   FROM node:18-alpine as build
   ```

2. Tăng thêm bộ nhớ nếu cần:
   ```dockerfile
   ENV NODE_OPTIONS="--max-old-space-size=8192"
   ```

## Lỗi về npm install

Nếu gặp lỗi khi chạy `npm install`:

1. Sử dụng `npm ci` thay vì `npm install` để cài đặt chính xác theo package-lock.json:
   ```dockerfile
   RUN npm ci
   ```

2. Tránh lỗi về bộ nhớ trong quá trình cài đặt:
   ```dockerfile
   RUN npm install --no-optional
   ```

## Lỗi về Docker build resource

Nếu máy chủ Docker không có đủ tài nguyên:

1. Tăng cấu hình tài nguyên cho Docker daemon
2. Sử dụng tham số `--memory` khi chạy container:
   ```bash
   docker-compose up --build -d --memory="4g"
   ```

## Giải pháp khác

Nếu các giải pháp trên không giúp khắc phục lỗi:

1. Build frontend trên máy local và chỉ copy build output vào Docker:
   ```bash
   # Trên máy local
   cd lms_micro_services/frontend-admin
   npm install
   npm run build
   
   # Sau đó sửa Dockerfile
   FROM nginx:alpine
   COPY build /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   # etc...
   ```

2. Sử dụng multi-stage build với Node.js phiên bản đầy đủ (không phải alpine) cho build stage:
   ```dockerfile
   FROM node:16 as build
   # Build stage
   
   FROM nginx:alpine
   # Production stage
   ```