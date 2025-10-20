# Khắc phục lỗi thiếu email-validator trong dịch vụ backend

## Vấn đề

Các dịch vụ backend (auth-service, content-service, assignment-service) liên tục bị khởi động lại với lỗi sau:

```
ImportError: email-validator is not installed, run `pip install pydantic[email]`
```

Đây là do Pydantic yêu cầu gói `email-validator` để xác thực các trường email, nhưng gói này không được cài đặt trong các dịch vụ backend.

## Giải pháp

### Phương án 1: Thêm email-validator vào requirements.txt

Thêm dòng sau vào tệp `requirements.txt` của mỗi dịch vụ backend (auth-service, content-service, assignment-service):

```
email-validator==2.1.0
```

Sau đó rebuild và khởi động lại các dịch vụ:

```bash
docker-compose build auth-service content-service assignment-service
docker-compose up -d auth-service content-service assignment-service
```

### Phương án 2: Cài đặt trực tiếp trong container đang chạy (giải pháp tạm thời)

Nếu bạn không muốn rebuild container, bạn có thể chạy lệnh sau để cài đặt gói vào container đang chạy:

```bash
docker exec -it lms-auth-service pip install email-validator
docker exec -it lms-content-service pip install email-validator
docker exec -it lms-assignment-service pip install email-validator
```

Sau đó khởi động lại các dịch vụ:

```bash
docker-compose restart auth-service content-service assignment-service
```

### Phương án 3: Cập nhật Dockerfile

Sửa Dockerfile của mỗi dịch vụ backend để cài đặt `email-validator` trực tiếp:

```dockerfile
# Sau dòng cài đặt requirements
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir email-validator
```

## Giải pháp Lâu dài

Thêm `email-validator` vào tệp requirements.txt của mỗi dịch vụ backend là cách tốt nhất để đảm bảo nó được cài đặt khi container được xây dựng lại trong tương lai. Đảm bảo commit các thay đổi này vào repository để mọi triển khai trong tương lai sẽ bao gồm phụ thuộc này.