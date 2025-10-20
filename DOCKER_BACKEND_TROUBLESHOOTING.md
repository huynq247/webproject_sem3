# Khắc phục lỗi Pydantic trong Docker

## Vấn đề: Thiếu các biến môi trường bắt buộc

Khi triển khai các dịch vụ backend trên Docker, bạn có thể gặp lỗi Pydantic validation như sau:

```
pydantic_core._pydantic_core.ValidationError: 4 validation errors for Settings
redis_url
  Field required [type=missing]
rabbitmq_url
  Field required [type=missing]
local_ip
  Field required [type=missing]
public_ip
  Field required [type=missing]
```

## Giải pháp

### 1. Cập nhật docker-compose.yml với các biến môi trường thiếu

Thêm các biến môi trường bắt buộc vào mỗi dịch vụ backend trong file `docker-compose.yml`:

```yaml
auth-service:
  # Cấu hình hiện tại...
  environment:
    # Biến môi trường hiện có...
    
    # Thêm các biến môi trường thiếu
    - REDIS_URL=redis://lms-redis:6379/0
    - RABBITMQ_URL=amqp://guest:guest@lms-rabbitmq:5672/
    - LOCAL_IP=0.0.0.0
    - PUBLIC_IP=localhost
```

Lưu ý rằng chúng ta đã cập nhật để sử dụng các dịch vụ Redis và RabbitMQ đã có sẵn trong môi trường của bạn:
- Redis: `lms-redis` (cổng 6379)
- RabbitMQ: `lms-rabbitmq` (cổng 5672)

### 2. Đảm bảo các dịch vụ phụ thuộc đang chạy

Kiểm tra xem Redis và RabbitMQ đã chạy chưa:

```bash
docker ps | grep -E "redis|rabbit"
```

Nếu chúng chưa chạy, hãy khởi động chúng:

```bash
docker start lms-redis lms-rabbitmq
```

### 3. Khởi động lại các dịch vụ backend

Sau khi cập nhật cấu hình, khởi động lại các dịch vụ backend:

```bash
# Dừng các dịch vụ backend
docker-compose stop auth-service content-service assignment-service

# Khởi động lại
docker-compose up -d auth-service content-service assignment-service
```

### 4. Kiểm tra logs

Kiểm tra logs để đảm bảo các dịch vụ khởi động thành công:

```bash
docker-compose logs -f auth-service
docker-compose logs -f content-service
docker-compose logs -f assignment-service
```

## Giải pháp thay thế (nếu cần)

Nếu bạn không muốn hoặc không thể sử dụng Redis và RabbitMQ, bạn có thể sửa đổi mã nguồn để làm cho các biến này trở thành tùy chọn. Điều này đòi hỏi truy cập vào container và chỉnh sửa file `config.py` trong mỗi dịch vụ.

### Sửa đổi file cấu hình

1. Truy cập container:
   ```bash
   docker exec -it lms-auth-service /bin/sh
   ```

2. Cài đặt trình soạn thảo:
   ```bash
   apk add vim
   ```

3. Chỉnh sửa file cấu hình:
   ```bash
   vim /app/app/core/config.py
   ```

4. Tìm class `Settings` và sửa đổi các trường bắt buộc thành tùy chọn với giá trị mặc định:
   ```python
   class Settings(BaseSettings):
       # Các trường khác...
       
       # Sửa từ bắt buộc thành tùy chọn
       redis_url: str = ""  # Hoặc một giá trị mặc định hợp lý
       rabbitmq_url: str = ""
       local_ip: str = "0.0.0.0"
       public_ip: str = "localhost"
   ```

5. Lưu file và thoát

6. Khởi động lại container:
   ```bash
   exit
   docker-compose restart auth-service
   ```

Lặp lại quy trình này cho các dịch vụ content-service và assignment-service.