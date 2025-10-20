# Hướng Dẫn Chạy Backend Microservices

## 📋 Các Microservices

1. **Auth Service** - Port 8001
   - Xác thực người dùng
   - Quản lý JWT tokens

2. **Content Service** - Port 8002
   - Quản lý khóa học, bài học
   - Quản lý decks và flashcards
   - AI flashcard generation

3. **Assignment Service** - Port 8003
   - Quản lý bài tập
   - Theo dõi tiến độ học tập

---

## 🚀 Cách 1: Sử Dụng PowerShell Script (Khuyến Nghị) ⭐

### Chạy tất cả services cùng lúc:
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services
.\start-all-backends.ps1
```

Script này sẽ tự động mở 3 cửa sổ PowerShell riêng biệt cho mỗi service.

---

## 🎯 Cách 2: Sử Dụng Script BAT

### Chạy từng service riêng lẻ:

**Auth Service:**
```cmd
cd D:\XProject\X1.1MicroService\lms_micro_services
start-auth-service.bat
```

**Content Service:**
```cmd
cd D:\XProject\X1.1MicroService\lms_micro_services
start-content-service.bat
```

**Assignment Service:**
```cmd
cd D:\XProject\X1.1MicroService\lms_micro_services
start-assignment-service.bat
```

### Chạy tất cả services:
```cmd
cd D:\XProject\X1.1MicroService\lms_micro_services
start-all-backends.bat
```

---

## 🖱️ Cách 3: Double Click (Dễ Nhất)

1. Mở Windows Explorer
2. Navigate đến: `D:\XProject\X1.1MicroService\lms_micro_services\`
3. Double-click vào file:
   - **`start-all-backends.ps1`** - Chạy tất cả services (PowerShell)
   - **`start-all-backends.bat`** - Chạy tất cả services (CMD)
   - `start-auth-service.bat` - Chỉ chạy Auth Service
   - `start-content-service.bat` - Chỉ chạy Content Service
   - `start-assignment-service.bat` - Chỉ chạy Assignment Service

---

## 📝 Cách 4: Chạy Thủ Công (Development)

### Bước 1: Mở 3 cửa sổ PowerShell/CMD riêng biệt

### Bước 2: Chạy từng service

**Terminal 1 - Auth Service:**
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\auth-service
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe main.py
```

**Terminal 2 - Content Service:**
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\content-service
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe main.py
```

**Terminal 3 - Assignment Service:**
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\assignment-service
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe main.py
```

---

## ✅ Kiểm Tra Services Đang Chạy

### Kiểm tra trong trình duyệt:

- **Auth Service**: http://localhost:8001/docs
- **Content Service**: http://localhost:8002/docs
- **Assignment Service**: http://localhost:8003/docs

### Kiểm tra bằng PowerShell:
```powershell
# Test Auth Service
Invoke-RestMethod http://localhost:8001/health

# Test Content Service  
Invoke-RestMethod http://localhost:8002/health

# Test Assignment Service
Invoke-RestMethod http://localhost:8003/health
```

### Kiểm tra ports đang được sử dụng:
```powershell
netstat -ano | findstr "8001 8002 8003"
```

---

## 🛑 Dừng Services

### Cách 1: Trong cửa sổ Terminal
- Nhấn `Ctrl + C` để dừng service

### Cách 2: Đóng cửa sổ
- Click vào nút `X` để đóng cửa sổ PowerShell/CMD

### Cách 3: Dừng tất cả Python processes
```powershell
# List tất cả python processes
Get-Process python | Select-Object Id, ProcessName, Path

# Kill tất cả python processes
Get-Process python | Stop-Process -Force
```

### Cách 4: Kill process theo port
```powershell
# Tìm PID của process đang dùng port 8001
netstat -ano | findstr :8001

# Kill process (thay <PID> bằng số process ID)
taskkill /F /PID <PID>
```

---

## 🔧 Troubleshooting

### ❌ Lỗi: "Port already in use"
```powershell
# Tìm process đang dùng port (ví dụ port 8001)
netstat -ano | findstr :8001

# Kill process
taskkill /F /PID <PID>

# Hoặc kill tất cả Python
Get-Process python | Stop-Process -Force
```

### ❌ Lỗi: "Module not found"
```powershell
# Kiểm tra xem đang dùng Python nào
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe --version

# Cài lại dependencies
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### ❌ Lỗi: "Connection refused" (Database)
```bash
# Trên server (14.161.50.86), kiểm tra containers
docker ps | grep -E "postgres|mongo|redis"

# Khởi động lại nếu cần
docker start lms-postgres
docker start mongodb  
docker start lms-redis
```

### ❌ Lỗi: "Can't open file main.py"
Đảm bảo bạn đang chạy từ đúng thư mục service:
```powershell
# Sai ❌
cd D:\XProject\X1.1MicroService
python main.py

# Đúng ✅
cd D:\XProject\X1.1MicroService\lms_micro_services\auth-service
D:\XProject\X1.1MicroService\.venv\Scripts\python.exe main.py
```

---

## 📊 Monitoring & Logs

### Xem logs real-time:
Services đang chạy sẽ hiển thị logs trực tiếp trong terminal.

### Check database connections:
```powershell
# Auth Service logs sẽ hiển thị:
# 📊 Database URL: postgresql://admin:***@14.161.50.86:25432/postgres

# Content Service logs sẽ hiển thị:
# 📊 MongoDB URL: mongodb://14.161.50.86:27017
```

---

## 🎓 Workflow Khuyến Nghị

### Development (Đang code):
1. Chạy từng service riêng lẻ trong các terminal khác nhau
2. Dễ dàng debug và xem logs của từng service
3. Restart service nhanh khi code thay đổi

### Testing (Test tích hợp):
1. Sử dụng `start-all-backends.ps1` để chạy tất cả
2. Test integration giữa các services
3. Test workflow end-to-end

### Production (Deploy thật):
1. Sử dụng Docker hoặc PM2
2. Hoặc deploy từng service lên server riêng
3. Sử dụng reverse proxy (Nginx, Traefik)

---

## � Environment Variables

Mỗi service cần file `.env` trong thư mục của nó:

```
lms_micro_services/
├── auth-service/.env
├── content-service/.env
└── assignment-service/.env
```

**Cấu hình quan trọng:**
- `DATABASE_URL`: Kết nối PostgreSQL
- `MONGODB_URL`: Kết nối MongoDB  
- `REDIS_URL`: Kết nối Redis
- `SECRET_KEY`: JWT secret key

---

## 📞 Support & Issues

### Common Issues:

1. **Service không khởi động**: Kiểm tra file `.env` có đúng không
2. **Database connection failed**: Kiểm tra containers trên server
3. **Port conflict**: Kill process đang dùng port đó
4. **Module not found**: Cài lại dependencies

### Logs Location:
- Logs hiển thị trực tiếp trong terminal
- Không có file log riêng (có thể thêm sau)

---

## 🎉 Quick Start (TL;DR)

```powershell
# Cách nhanh nhất:
cd D:\XProject\X1.1MicroService\lms_micro_services
.\start-all-backends.ps1

# Sau đó mở browser:
# http://localhost:8001/docs  (Auth)
# http://localhost:8002/docs  (Content)
# http://localhost:8003/docs  (Assignment)
```

**Happy Coding! 🚀**

