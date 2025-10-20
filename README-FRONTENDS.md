# 🎨 HƯỚNG DẪN CHẠY FRONTENDS

## 📋 Tổng quan
Project LMS có **4 frontends React** độc lập, mỗi frontend phục vụ một role khác nhau:

| Frontend | Port | Role | URL |
|----------|------|------|-----|
| **Admin Frontend** | 3001 | ADMIN | http://localhost:3001 |
| **Teacher Frontend** | 3002 | TEACHER | http://localhost:3002 |
| **Student Frontend** | 3003 | STUDENT | http://localhost:3003 |
| **Main Frontend** | 3000 | ALL | http://localhost:3000 |

---

## 🚀 Khởi động nhanh

### ✅ Bước 1: Cài đặt dependencies (Chỉ chạy 1 lần đầu tiên)
```cmd
install-frontend-dependencies.bat
```

Hoặc double-click vào file `install-frontend-dependencies.bat`

**Lưu ý:** Bước này sẽ mất **5-10 phút** tùy vào tốc độ mạng và máy tính.

---

### ✅ Bước 2: Khởi động tất cả frontends
```cmd
start-all-frontends.bat
```

Hoặc double-click vào file `start-all-frontends.bat`

**Kết quả:**
- Mở 4 cửa sổ CMD riêng biệt
- Mỗi frontend sẽ tự động build và chạy
- Trình duyệt sẽ tự động mở sau khi build xong (30-60 giây)

---

## 📦 Cài đặt dependencies thủ công

Nếu bạn muốn cài đặt từng frontend một:

### Admin Frontend (Port 3001)
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\frontend-admin
npm install
```

### Teacher Frontend (Port 3002)
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\frontend-teacher
npm install
```

### Student Frontend (Port 3003)
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\frontend-student
npm install
```

### Main Frontend (Port 3000)
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\frontend
npm install
```

---

## 🎯 Chạy từng frontend riêng lẻ

### Admin Frontend
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\frontend-admin
npm start
```
Truy cập: http://localhost:3001

### Teacher Frontend
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\frontend-teacher
npm start
```
Truy cập: http://localhost:3002

### Student Frontend
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\frontend-student
npm start
```
Truy cập: http://localhost:3003

### Main Frontend
```powershell
cd D:\XProject\X1.1MicroService\lms_micro_services\frontend
npm start
```
Truy cập: http://localhost:3000

---

## 🛑 Dừng frontends

### Cách 1: Sử dụng script
```cmd
stop-all-frontends.bat
```

### Cách 2: Dừng thủ công
- Vào từng cửa sổ CMD của frontend
- Nhấn **Ctrl + C**
- Chọn `Y` khi được hỏi

### Cách 3: Kill processes
```powershell
# Dừng tất cả Node.js processes
Get-Process node | Stop-Process -Force
```

---

## 🧪 Kiểm tra trạng thái

### Kiểm tra ports đang lắng nghe
```powershell
netstat -ano | Select-String "3000|3001|3002|3003" | Select-String "LISTENING"
```

### Kiểm tra Node.js processes
```powershell
Get-Process node
```

### Test frontend APIs
```powershell
# Admin Frontend
Invoke-RestMethod http://localhost:3001

# Teacher Frontend
Invoke-RestMethod http://localhost:3002

# Student Frontend
Invoke-RestMethod http://localhost:3003

# Main Frontend
Invoke-RestMethod http://localhost:3000
```

---

## 📊 Yêu cầu hệ thống

- **Node.js:** v18+ (Hiện tại: v22.16.0 ✅)
- **npm:** v9+ (Hiện tại: v10.9.2 ✅)
- **RAM:** Minimum 4GB (Recommended 8GB)
- **Disk:** ~500MB cho mỗi frontend (node_modules)
- **Browser:** Chrome, Firefox, Edge (latest versions)

---

## 🔧 Troubleshooting

### ❌ Lỗi: Port đã được sử dụng

**Triệu chứng:**
```
Something is already running on port 3001.
Would you like to run the app on another port instead?
```

**Giải pháp:**
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :3001

# Kill process (thay <PID> bằng số thực tế)
taskkill /PID <PID> /F
```

---

### ❌ Lỗi: npm install fails

**Triệu chứng:**
```
npm ERR! code ECONNREFUSED
npm ERR! errno ECONNREFUSED
```

**Giải pháp 1: Clear npm cache**
```powershell
npm cache clean --force
npm install
```

**Giải pháp 2: Delete node_modules và package-lock.json**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

**Giải pháp 3: Sử dụng registry khác**
```powershell
npm config set registry https://registry.npmjs.org/
npm install
```

---

### ❌ Lỗi: Module not found

**Triệu chứng:**
```
Module not found: Error: Can't resolve 'react-router-dom'
```

**Giải pháp:**
```powershell
# Cài lại dependencies
npm install

# Hoặc cài module cụ thể
npm install react-router-dom
```

---

### ❌ Lỗi: Compilation errors

**Triệu chứng:**
```
Failed to compile.
./src/App.tsx
```

**Giải pháp:**
1. Kiểm tra syntax errors trong code
2. Clear build cache:
```powershell
Remove-Item -Recurse -Force .cache
Remove-Item -Recurse -Force build
npm start
```

---

### ⚠️ Frontend không kết nối được backend

**Kiểm tra:**
1. Backend services có đang chạy không?
```powershell
netstat -ano | Select-String "8001|8002|8003" | Select-String "LISTENING"
```

2. Kiểm tra API Gateway có chạy không? (nếu có)
```powershell
Invoke-RestMethod http://localhost:8000/health
```

3. Kiểm tra file `.env` hoặc `config` trong frontend:
- `REACT_APP_API_URL` phải trỏ đúng đến backend
- Thường là: `http://localhost:8000` (API Gateway) hoặc `http://localhost:800X` (direct service)

---

## 📁 Cấu trúc thư mục

```
D:\XProject\X1.1MicroService\
├── lms_micro_services/
│   ├── frontend/                   # Main frontend (port 3000)
│   │   ├── public/
│   │   ├── src/
│   │   ├── package.json
│   │   └── node_modules/
│   ├── frontend-admin/             # Admin frontend (port 3001)
│   │   ├── public/
│   │   ├── src/
│   │   ├── package.json
│   │   └── node_modules/
│   ├── frontend-teacher/           # Teacher frontend (port 3002)
│   │   ├── public/
│   │   ├── src/
│   │   ├── package.json
│   │   └── node_modules/
│   └── frontend-student/           # Student frontend (port 3003)
│       ├── public/
│       ├── src/
│       ├── package.json
│       └── node_modules/
├── start-all-frontends.bat         # Script chạy tất cả frontends
├── install-frontend-dependencies.bat # Script cài dependencies
├── stop-all-frontends.bat          # Script dừng tất cả frontends
└── README-FRONTENDS.md             # File này
```

---

## 🎨 Tech Stack

Tất cả frontends sử dụng:
- **React** v19.1.1
- **TypeScript** v4.9.5
- **React Router** v7.8.1
- **Material-UI** (hoặc custom components)
- **Axios** v1.11.0
- **React Query** (TanStack Query)
- **React Hook Form** v7.62.0

---

## 🔐 Authentication Flow

1. User truy cập frontend tương ứng với role
2. Nếu chưa login → redirect đến `/login`
3. Sau khi login → nhận JWT token
4. Token được lưu trong localStorage
5. Mọi API request đều gửi kèm token trong header:
   ```
   Authorization: Bearer <token>
   ```

---

## 🌐 API Endpoints

Frontends kết nối đến các backend services:

| Service | Port | Base URL |
|---------|------|----------|
| **Auth Service** | 8001 | http://localhost:8001/api/v1 |
| **Content Service** | 8002 | http://localhost:8002/api/v1 |
| **Assignment Service** | 8003 | http://localhost:8003/api |
| **API Gateway** (nếu có) | 8000 | http://localhost:8000/api |

---

## 📝 Notes

- **First run:** Lần chạy đầu tiên sẽ mất thời gian để npm install dependencies (~5-10 phút)
- **Subsequent runs:** Các lần sau sẽ nhanh hơn vì đã có node_modules (~30-60 giây)
- **Hot reload:** React có tính năng hot reload, code thay đổi sẽ tự động cập nhật
- **Build for production:** Dùng `npm run build` để tạo production build
- **Environment variables:** Cấu hình trong file `.env` hoặc `.env.local`

---

## 🎯 Development Workflow

### Workflow thông thường:

1. **Khởi động backends** (nếu chưa chạy):
   ```cmd
   start-all-services.bat
   ```

2. **Khởi động frontends**:
   ```cmd
   start-all-frontends.bat
   ```

3. **Phát triển**:
   - Code trong `src/` folder
   - Frontend tự động reload khi save file
   - Kiểm tra console trong browser để debug

4. **Commit changes**:
   ```powershell
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

---

## 🔗 Tài liệu tham khảo

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Router Documentation](https://reactrouter.com/)
- [Create React App Documentation](https://create-react-app.dev/)
- [npm Documentation](https://docs.npmjs.com/)

---

**Chúc bạn phát triển frontend thành công! 🎨✨**
