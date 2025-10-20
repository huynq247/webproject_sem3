# Hướng dẫn triển khai ứng dụng LMS Micro Services trên RedHat Server

Tài liệu này cung cấp các bước chi tiết để triển khai ứng dụng LMS Micro Services trên một máy chủ RedHat sử dụng Docker và docker-compose.

## Yêu cầu hệ thống

- RedHat Enterprise Linux 8 hoặc CentOS 8 trở lên
- Docker 20.10.x trở lên
- Docker Compose 2.x trở lên
- Git
- Kết nối internet
- Tối thiểu 4GB RAM, 2 CPU cores
- Ít nhất 10GB dung lượng đĩa trống

## Bước 1: Cài đặt Docker và Docker Compose

### 1.1. Cài đặt Docker

```bash
# Cài đặt các gói phụ thuộc
sudo dnf install -y yum-utils device-mapper-persistent-data lvm2

# Thêm Docker repository
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Cài đặt Docker Engine
sudo dnf install -y docker-ce docker-ce-cli containerd.io

# Khởi động và bật Docker
sudo systemctl start docker
sudo systemctl enable docker

# Kiểm tra Docker đã cài đặt thành công
docker --version
```

### 1.2. Cài đặt Docker Compose

```bash
# Tải Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.15.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Cấp quyền thực thi
sudo chmod +x /usr/local/bin/docker-compose

# Tạo symbolic link
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Kiểm tra Docker Compose đã cài đặt thành công
docker-compose --version
```

## Bước 2: Chuẩn bị ứng dụng

### 2.1. Clone dự án từ GitHub

```bash
git clone https://github.com/huynq247/webproject_sem3.git
cd webproject_sem3
```

### 2.2. Kiểm tra cấu hình

Đảm bảo file `docker-compose.yml` đã được cấu hình đúng với các thông tin kết nối database:

```bash
cat docker-compose.yml
```

## Bước 3: Triển khai ứng dụng

### 3.1. Build và chạy các container

```bash
# Build tất cả các services
docker-compose build

# Chạy ứng dụng ở chế độ detached (ngầm)
docker-compose up -d
```

### 3.2. Kiểm tra trạng thái các container

```bash
# Xem tất cả các containers đang chạy
docker-compose ps

# Xem logs của tất cả các services
docker-compose logs

# Xem logs của một service cụ thể
docker-compose logs api-gateway
```

## Bước 4: Cấu hình tường lửa

Mở các port cần thiết trên tường lửa để có thể truy cập các dịch vụ từ bên ngoài:

```bash
# Mở các port cho frontend và api-gateway
sudo firewall-cmd --permanent --add-port=3001/tcp --add-port=3002/tcp --add-port=3003/tcp --add-port=8000/tcp
sudo firewall-cmd --reload

# Kiểm tra các port đã được mở
sudo firewall-cmd --list-ports
```

## Bước 5: Truy cập và kiểm tra ứng dụng

- Admin Frontend: http://[server-ip]:3001
- Teacher Frontend: http://[server-ip]:3002
- Student Frontend: http://[server-ip]:3003
- API Gateway: http://[server-ip]:8000

## Bước 6: Giám sát và bảo trì

### 6.1. Kiểm tra sức khỏe các services

```bash
# Kiểm tra health check status
docker inspect --format='{{json .State.Health.Status}}' lms-api-gateway
docker inspect --format='{{json .State.Health.Status}}' lms-auth-service
docker inspect --format='{{json .State.Health.Status}}' lms-content-service
docker inspect --format='{{json .State.Health.Status}}' lms-assignment-service
```

### 6.2. Khởi động lại các services

```bash
# Khởi động lại một service cụ thể
docker-compose restart auth-service

# Khởi động lại tất cả các services
docker-compose restart
```

### 6.3. Cập nhật ứng dụng

```bash
# Pull các thay đổi mới từ repository
git pull

# Rebuild và khởi động lại các services
docker-compose down
docker-compose build
docker-compose up -d
```

## Xử lý sự cố

### Lỗi build frontend

Nếu bạn gặp lỗi khi build các ứng dụng frontend như lỗi "Fatal error: Check failed: CodeKindCanDeoptimize(code.kind())", vui lòng tham khảo file `FRONTEND_BUILD_TROUBLESHOOTING.md` để biết cách khắc phục.

Các lỗi này đã được khắc phục trong các Dockerfile của frontend bằng cách:
1. Tăng bộ nhớ heap cho Node.js: `ENV NODE_OPTIONS="--max-old-space-size=4096"`
2. Bỏ qua các warnings khi build: `RUN CI=false npm run build`

### Kiểm tra logs

```bash
# Xem logs theo thời gian thực
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f service-name
```

### Kiểm tra kết nối mạng

```bash
# Kiểm tra mạng Docker
docker network ls
docker network inspect lms-network
```

### Kiểm tra tài nguyên hệ thống

```bash
# Kiểm tra sử dụng CPU và RAM
docker stats
```

### Vấn đề về kết nối database

Đảm bảo rằng server RedHat có thể kết nối đến các database bên ngoài (PostgreSQL: 14.161.50.86:25432, MongoDB: 14.161.50.86:27017):

```bash
# Kiểm tra kết nối đến PostgreSQL
nc -zv 14.161.50.86 25432

# Kiểm tra kết nối đến MongoDB
nc -zv 14.161.50.86 27017
```

## Các lệnh hữu ích khác

### Quản lý Docker cache

```bash
# Xóa các container không sử dụng
docker container prune

# Xóa các image không sử dụng
docker image prune

# Xóa tất cả các networks không sử dụng
docker network prune

# Xóa tất cả các volumes không sử dụng
docker volume prune

# Xóa tất cả (container, image, network, volume) không sử dụng
docker system prune
```