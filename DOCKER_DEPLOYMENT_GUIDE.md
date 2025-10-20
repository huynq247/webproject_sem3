# LMS Microservices Deployment Guide for RedHat

Hướng dẫn triển khai ứng dụng LMS Microservices trên Docker cho máy chủ RedHat.

## Yêu cầu hệ thống

- RedHat Enterprise Linux 8 hoặc CentOS 8+
- Docker 20.10+
- Docker Compose 2.0+
- Git

## Cài đặt môi trường

### 1. Cài đặt Docker và Docker Compose

```bash
# Cài đặt yum-utils
sudo yum install -y yum-utils

# Thêm Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Cài đặt Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Khởi động và bật Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Thêm user hiện tại vào nhóm docker
sudo usermod -aG docker $USER

# Kiểm tra Docker đã cài đặt thành công
docker --version
docker compose version
```

### 2. Clone Repository

```bash
git clone https://github.com/huynq247/webproject_sem3.git
cd webproject_sem3
```

### 3. Cài đặt file permissions cho script khởi tạo database

```bash
chmod +x scripts/create-multiple-postgresql-databases.sh
```

## Triển khai ứng dụng

### 1. Xây dựng và khởi chạy các container

```bash
docker compose up -d --build
```

### 2. Kiểm tra trạng thái các container

```bash
docker compose ps
```

### 3. Xem logs của các container

```bash
# Xem logs của tất cả các container
docker compose logs

# Xem logs của một service cụ thể
docker compose logs api-gateway
docker compose logs auth-service
```

## Truy cập ứng dụng

Sau khi triển khai thành công, bạn có thể truy cập các ứng dụng qua các URL sau:

- API Gateway: http://<server-ip>:8000
- Admin Frontend: http://<server-ip>:3001
- Teacher Frontend: http://<server-ip>:3002
- Student Frontend: http://<server-ip>:3003

## Quản lý ứng dụng

### Khởi động lại các service

```bash
docker compose restart
```

### Dừng các service

```bash
docker compose stop
```

### Dừng và xóa các container

```bash
docker compose down
```

### Dừng, xóa các container và volume

```bash
docker compose down -v
```

## Khắc phục sự cố

### Kiểm tra logs

```bash
docker compose logs --tail=100 <service-name>
```

### Truy cập vào container

```bash
docker compose exec <service-name> bash
```

### Kiểm tra kết nối mạng

```bash
docker network inspect lms-network
```

## Cập nhật ứng dụng

Để cập nhật ứng dụng:

```bash
# Pull code mới nhất
git pull

# Xây dựng lại và khởi động các container
docker compose down
docker compose up -d --build
```