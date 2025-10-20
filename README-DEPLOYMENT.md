# Hướng dẫn nhanh triển khai trên RedHat

## Chuẩn bị

1. Đảm bảo server RedHat đã cài đặt Docker và Docker Compose
2. Đảm bảo server có thể kết nối đến các database bên ngoài (PostgreSQL và MongoDB)

## Triển khai

### Phương pháp 1: Sử dụng script tự động

```bash
# Clone repository từ GitHub
git clone https://github.com/huynq247/webproject_sem3.git
cd webproject_sem3

# Cấp quyền thực thi cho script
chmod +x deploy_on_redhat.sh

# Chạy script triển khai
./deploy_on_redhat.sh
```

### Phương pháp 2: Triển khai thủ công

```bash
# Clone repository từ GitHub
git clone https://github.com/huynq247/webproject_sem3.git
cd webproject_sem3

# Build và chạy ứng dụng
docker-compose build
docker-compose up -d

# Kiểm tra trạng thái
docker-compose ps
```

## Truy cập ứng dụng

- Admin Frontend: http://[server-ip]:3001
- Teacher Frontend: http://[server-ip]:3002
- Student Frontend: http://[server-ip]:3003
- API Gateway: http://[server-ip]:8000

## Gỡ lỗi

Xem logs của các services:

```bash
# Xem logs của tất cả các services
docker-compose logs

# Xem logs của một service cụ thể
docker-compose logs api-gateway
```

## Chi tiết

Xem file `REDHAT_DEPLOYMENT_GUIDE.md` để biết thêm chi tiết về triển khai và cấu hình.