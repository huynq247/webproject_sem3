# 🚀 HƯỚNG DẪN CHẠY MICROSERVICES

## 📋 Mục lục
- [Khởi động nhanh](#khởi-động-nhanh)
- [Các phương pháp khởi động](#các-phương-pháp-khởi-động)
- [Kiểm tra trạng thái](#kiểm-tra-trạng-thái)
- [Dừng services](#dừng-services)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Khởi động nhanh

### Cách 1: Sử dụng PowerShell Script (Khuyến nghị)
```powershell
.\start-all-services.ps1
```

### Cách 2: Sử dụng Batch File
```cmd
start-all-services.bat
```

### Cách 3: Double-click
- Double-click vào file `start-all-services.bat` hoặc `start-all-services.ps1`

---

## 📚 Các phương pháp khởi động

### 1️⃣ PowerShell Script (start-all-services.ps1)
**Ưu điểm:**
- Tự động kiểm tra health của services
- Hiển thị trạng thái chi tiết
- Có màu sắc dễ đọc

**Cách dùng:**
```powershell
# Mở PowerShell tại thư mục gốc project
cd D:\XProject\X1.1MicroService

# Chạy script
.\start-all-services.ps1
```

**Kết quả:**
- Mở 3 cửa sổ PowerShell riêng biệt cho từng service
- Tự động kiểm tra health sau 15 giây
- Hiển thị link đến API Documentation

---

### 2️⃣ Batch File (start-all-services.bat)
**Ưu điểm:**
- Đơn giản, không cần cấu hình
- Tương thích với mọi Windows

**Cách dùng:**
```cmd
# Mở Command Prompt tại thư mục gốc project
cd D:\XProject\X1.1MicroService

# Chạy script
start-all-services.bat
```

**Hoặc:** Double-click vào file `start-all-services.bat`

---

### 3️⃣ Chạy thủ công từng service

#### Auth Service (Port 8001)
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\auth-service
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe main.py
```

#### Content Service (Port 8002)
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\content-service
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe main.py
```

#### Assignment Service (Port 8003)
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\assignment-service
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe main.py
```

---

## 🧪 Kiểm tra trạng thái

### Kiểm tra health endpoints
```powershell
# Auth Service
Invoke-RestMethod http://localhost:8001/health

# Content Service
Invoke-RestMethod http://localhost:8002/health

# Assignment Service
Invoke-RestMethod http://localhost:8003/health
```

### Kiểm tra ports đang lắng nghe
```powershell
netstat -ano | Select-String "8001|8002|8003" | Select-String "LISTENING"
```

### Kiểm tra Python processes
```powershell
Get-Process python
```

---

## 🌐 Truy cập API Documentation

Sau khi các services đã khởi động thành công:

| Service | Swagger UI | Health Check |
|---------|-----------|--------------|
| **Auth Service** | http://localhost:8001/docs | http://localhost:8001/health |
| **Content Service** | http://localhost:8002/docs | http://localhost:8002/health |
| **Assignment Service** | http://localhost:8003/docs | http://localhost:8003/health |

---

## 🛑 Dừng services

### Cách 1: Sử dụng PowerShell Script
```powershell
.\stop-all-services.ps1
```

### Cách 2: Sử dụng Batch File
```cmd
stop-all-services.bat
```

### Cách 3: Dừng thủ công
- Vào từng cửa sổ PowerShell/CMD của service
- Nhấn **Ctrl + C**

### Cách 4: Kill processes
```powershell
# Dừng tất cả Python processes
Get-Process python | Stop-Process -Force

# Hoặc dừng từng process theo PID
taskkill /PID <process_id> /F
```

---

## 🔧 Troubleshooting

### ❌ Lỗi: Port đã được sử dụng

**Triệu chứng:**
```
OSError: [WinError 10048] Only one usage of each socket address is normally permitted
```

**Giải pháp:**
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :8001

# Kill process (thay <PID> bằng số thực tế)
taskkill /PID <PID> /F
```

---

### ❌ Lỗi: ModuleNotFoundError

**Triệu chứng:**
```
ModuleNotFoundError: No module named 'xxx'
```

**Giải pháp:**
```powershell
# Cài module còn thiếu
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe -m pip install <tên-module>

# Hoặc cài tất cả dependencies
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

---

### ❌ Lỗi: Không kết nối được database

**Triệu chứng:**
```
could not connect to server: Connection refused
```

**Giải pháp:**
1. Kiểm tra PostgreSQL/MongoDB container đang chạy:
```bash
ssh root@14.161.50.86 "docker ps | grep -E 'postgres|mongo'"
```

2. Kiểm tra file `.env` trong thư mục service:
```env
DATABASE_URL=postgresql://admin:Mypassword123@14.161.50.86:25432/postgres
MONGODB_URL=mongodb://14.161.50.86:27017
REDIS_URL=redis://14.161.50.86:6379
```

3. Kiểm tra network connectivity:
```powershell
Test-NetConnection -ComputerName 14.161.50.86 -Port 25432
```

---

### ❌ Lỗi: Python not found

**Triệu chứng:**
```
python: command not found
```

**Giải pháp:**
Sử dụng đường dẫn đầy đủ đến Python executable:
```powershell
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe
```

---

### ⚠️ Service chạy nhưng không response

**Kiểm tra:**
1. Xem logs trong cửa sổ PowerShell/CMD của service
2. Kiểm tra file `.env` có đúng không
3. Kiểm tra database connection
4. Đợi thêm 10-30 giây (services cần thời gian khởi động)

---

## 📦 Cấu trúc thư mục

```
D:\XProject\X1.1MicroService\
├── .venv/                          # Virtual environment
├── lms_micro_services/
│   ├── auth-service/
│   │   ├── main.py
│   │   ├── .env
│   │   └── ...
│   ├── content-service/
│   │   ├── main.py
│   │   ├── .env
│   │   └── ...
│   └── assignment-service/
│       ├── main.py
│       ├── .env
│       └── ...
├── start-all-services.ps1          # PowerShell script để chạy tất cả
├── start-all-services.bat          # Batch script để chạy tất cả
├── stop-all-services.ps1           # PowerShell script để dừng tất cả
├── stop-all-services.bat           # Batch script để dừng tất cả
└── README-SERVICES.md              # File này
```

---

## 🔑 Environment Variables

Các services sử dụng các biến môi trường sau (trong file `.env`):

### Auth Service
```env
DATABASE_URL=postgresql://admin:Mypassword123@14.161.50.86:25432/postgres
REDIS_URL=redis://14.161.50.86:6379
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Content Service
```env
MONGODB_URL=mongodb://14.161.50.86:27017
REDIS_URL=redis://14.161.50.86:6379
AUTH_SERVICE_URL=http://localhost:8001
GEMINI_API_KEY=your-gemini-api-key
```

### Assignment Service
```env
DATABASE_URL=postgresql://admin:Mypassword123@14.161.50.86:25432/postgres
REDIS_URL=redis://14.161.50.86:6379
AUTH_SERVICE_URL=http://localhost:8001
CONTENT_SERVICE_URL=http://localhost:8002
```

---

## 📊 System Requirements

- **OS:** Windows 10/11
- **Python:** 3.10+
- **RAM:** Minimum 4GB (Recommended 8GB)
- **Disk:** Minimum 2GB free space
- **Network:** Access to 14.161.50.86 (PostgreSQL, MongoDB, Redis)

---

## 🎓 Học thêm

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [MongoDB Motor Documentation](https://motor.readthedocs.io/)
- [Redis Python Documentation](https://redis-py.readthedocs.io/)

---

## 📝 Notes

- Các services sẽ tự động reload khi code thay đổi (nếu chạy với `--reload` flag)
- Logs sẽ được hiển thị trong terminal của từng service
- Để xem chi tiết API, truy cập `/docs` endpoint của từng service
- Health check endpoints: `/health`
- OpenAPI schema: `/openapi.json`

---

**Chúc bạn code vui vẻ! 🚀**
