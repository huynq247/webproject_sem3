#!/bin/bash
# Script triển khai ứng dụng LMS Microservices trên RedHat

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Hàm kiểm tra thành công
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        exit 1
    fi
}

# Hàm in tiêu đề
print_header() {
    echo -e "\n${YELLOW}===============================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}===============================================${NC}"
}

# Bước 1: Kiểm tra Docker và Docker Compose
print_header "Kiểm tra Docker và Docker Compose"

# Kiểm tra Docker
echo "Kiểm tra Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker không được cài đặt. Vui lòng cài đặt Docker trước.${NC}"
    exit 1
fi
docker_version=$(docker --version)
check_status "Docker đã được cài đặt: $docker_version"

# Kiểm tra Docker Compose
echo "Kiểm tra Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose không được cài đặt. Vui lòng cài đặt Docker Compose trước.${NC}"
    exit 1
fi
compose_version=$(docker-compose --version)
check_status "Docker Compose đã được cài đặt: $compose_version"

# Bước 2: Kiểm tra kết nối database
print_header "Kiểm tra kết nối database"

echo "Kiểm tra kết nối PostgreSQL (14.161.50.86:25432)..."
if command -v nc &> /dev/null; then
    nc -z -w 5 14.161.50.86 25432
    check_status "Kết nối PostgreSQL"
else
    echo -e "${YELLOW}⚠ Không thể kiểm tra kết nối PostgreSQL (nc command không có sẵn)${NC}"
fi

echo "Kiểm tra kết nối MongoDB (14.161.50.86:27017)..."
if command -v nc &> /dev/null; then
    nc -z -w 5 14.161.50.86 27017
    check_status "Kết nối MongoDB"
else
    echo -e "${YELLOW}⚠ Không thể kiểm tra kết nối MongoDB (nc command không có sẵn)${NC}"
fi

# Bước 3: Triển khai ứng dụng
print_header "Triển khai ứng dụng"

echo "Stopping và removing các containers cũ (nếu có)..."
docker-compose down
check_status "Xóa containers cũ"

echo "Building images mới..."
docker-compose build
check_status "Build images"

echo "Khởi chạy các containers..."
docker-compose up -d
check_status "Khởi chạy containers"

# Bước 4: Kiểm tra trạng thái
print_header "Kiểm tra trạng thái services"

echo "Đợi 30 giây để các services khởi động..."
sleep 30

echo "Trạng thái các services:"
docker-compose ps
services=("api-gateway" "auth-service" "content-service" "assignment-service" "frontend-admin" "frontend-teacher" "frontend-student")

# Kiểm tra health check của các services
for service in "${services[@]}"; do
    container_name="lms-${service}"
    health_status=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}không có health check{{end}}' $container_name 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        if [ "$health_status" = "healthy" ]; then
            echo -e "${GREEN}✓ $container_name: $health_status${NC}"
        else
            echo -e "${YELLOW}⚠ $container_name: $health_status${NC}"
        fi
    else
        echo -e "${RED}✗ $container_name: không tìm thấy container${NC}"
    fi
done

# Bước 5: Thông tin truy cập
print_header "Thông tin truy cập ứng dụng"

# Lấy địa chỉ IP của server
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "Admin Frontend: ${GREEN}http://$SERVER_IP:3001${NC}"
echo -e "Teacher Frontend: ${GREEN}http://$SERVER_IP:3002${NC}"
echo -e "Student Frontend: ${GREEN}http://$SERVER_IP:3003${NC}"
echo -e "API Gateway: ${GREEN}http://$SERVER_IP:8000${NC}"

print_header "Triển khai hoàn tất!"
echo -e "Để xem logs của tất cả các services: ${YELLOW}docker-compose logs -f${NC}"
echo -e "Để xem logs của một service cụ thể: ${YELLOW}docker-compose logs -f [service-name]${NC}"
echo -e "Để xem thêm thông tin về triển khai, vui lòng tham khảo file ${YELLOW}REDHAT_DEPLOYMENT_GUIDE.md${NC}"