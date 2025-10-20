# Khắc phục các lỗi thiếu gói phụ thuộc trong dịch vụ backend

## Vấn đề 1: Thiếu email-validator

Dịch vụ `auth-service` liên tục bị khởi động lại với lỗi sau:

```
ImportError: email-validator is not installed, run `pip install pydantic[email]`
```

Đây là do Pydantic yêu cầu gói `email-validator` để xác thực các trường email, nhưng gói này không được cài đặt trong các dịch vụ backend.

## Vấn đề 2: Thiếu pydantic-settings

Dịch vụ `content-service` liên tục bị khởi động lại với lỗi sau:

```
ModuleNotFoundError: No module named 'pydantic_settings'
```

Đây là do gói `pydantic-settings` không được cài đặt trong content-service, nhưng được sử dụng trong cấu hình.

## Vấn đề 3: Thiếu asyncpg

Dịch vụ `assignment-service` liên tục bị khởi động lại với lỗi sau:

```
ModuleNotFoundError: No module named 'asyncpg'
```

Đây là do gói `asyncpg` là bắt buộc cho SQLAlchemy khi sử dụng kết nối bất đồng bộ với PostgreSQL, nhưng gói này không được cài đặt.

## Giải pháp

### Phương án 1: Thêm các gói phụ thuộc còn thiếu vào requirements.txt

#### 1. Thêm email-validator cho auth-service

Thêm dòng sau vào tệp `requirements.txt` của auth-service:

```
email-validator==2.1.0
```

#### 2. Thêm pydantic-settings cho content-service

Thêm dòng sau vào tệp `requirements.txt` của content-service:

```
pydantic-settings==2.1.0
```

#### 3. Thêm email-validator và asyncpg cho assignment-service

Thêm các dòng sau vào tệp `requirements.txt` của assignment-service:

```
email-validator==2.1.0
asyncpg==0.29.0
```

Sau đó rebuild và khởi động lại các dịch vụ:

```bash
docker-compose build auth-service content-service assignment-service
docker-compose up -d auth-service content-service assignment-service
```

### Phương án 2: Cài đặt trực tiếp trong container đang chạy (giải pháp tạm thời)

Nếu bạn không muốn rebuild container, bạn có thể chạy lệnh sau để cài đặt gói vào container đang chạy:

```bash
# Cài đặt email-validator trong auth-service
docker exec -it lms-auth-service pip install email-validator

# Cài đặt pydantic-settings trong content-service
docker exec -it lms-content-service pip install pydantic-settings

# Cài đặt email-validator và asyncpg trong assignment-service
docker exec -it lms-assignment-service pip install email-validator asyncpg
```

Sau đó khởi động lại các dịch vụ:

```bash
docker-compose restart auth-service content-service assignment-service
```

### Phương án 3: Cập nhật Dockerfile

Sửa Dockerfile của các dịch vụ backend để cài đặt các gói phụ thuộc còn thiếu trực tiếp:

**auth-service/Dockerfile**:
```dockerfile
# Sau dòng cài đặt requirements
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir email-validator
```

**content-service/Dockerfile**:
```dockerfile
# Sau dòng cài đặt requirements
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir pydantic-settings
```

**assignment-service/Dockerfile**:
```dockerfile
# Sau dòng cài đặt requirements
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir email-validator asyncpg
```

## Giải pháp Lâu dài

Thêm các gói phụ thuộc còn thiếu vào tệp requirements.txt của mỗi dịch vụ backend là cách tốt nhất để đảm bảo chúng được cài đặt khi container được xây dựng lại trong tương lai. Đảm bảo commit các thay đổi này vào repository để mọi triển khai trong tương lai sẽ bao gồm đầy đủ các phụ thuộc.