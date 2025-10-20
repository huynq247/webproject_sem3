# 🔧 FIX LOGIN ISSUE - BCRYPT COMPATIBILITY

## ⚠️ Vấn đề
- Bcrypt 5.0.0 không tương thích với passlib
- User admin không thể login (401 Unauthorized)
- Password hash không đúng format

## ✅ Giải pháp tự động

### Cách 1: Sử dụng Batch Script (Windows)

```batch
fix-bcrypt-and-create-admin.bat
```

### Cách 2: Sử dụng PowerShell Script

```powershell
.\fix-bcrypt-and-create-admin.ps1
```

## 🔨 Script sẽ tự động thực hiện:

1. ✅ Xóa user admin cũ (có password hash sai)
2. ✅ Downgrade bcrypt từ 5.0.0 → 4.1.2
3. ✅ Khởi động lại Auth Service với bcrypt đúng
4. ✅ Tạo admin user mới qua API (password hash đúng)
5. ✅ Hiển thị thông tin đăng nhập

## 📝 Hướng dẫn thủ công (nếu script lỗi)

### Bước 1: Dừng Auth Service
```
Nhấn Ctrl+C ở terminal đang chạy Auth Service
```

### Bước 2: Xóa user cũ
```powershell
python -c "import psycopg2; conn = psycopg2.connect(host='14.161.50.86', port=25432, database='postgres', user='admin', password='Mypassword123'); cursor = conn.cursor(); cursor.execute('DELETE FROM users WHERE username = ''admin'''); conn.commit(); print('Deleted'); cursor.close(); conn.close()"
```

### Bước 3: Downgrade bcrypt
```powershell
pip uninstall bcrypt -y
pip install "bcrypt==4.1.2"
```

### Bước 4: Khởi động lại Auth Service
```powershell
cd lms_micro_services\auth-service
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Bước 5: Tạo admin user (terminal mới)
```powershell
python create_admin_via_api.py
```

### Bước 6: Test login
```powershell
python test_login.py
```

## 🧪 Test Login

Sau khi fix xong, chạy:

```powershell
python test_login.py
```

Script sẽ test cả 2 endpoints:
- ✅ Auth Service trực tiếp (port 8001)
- ✅ API Gateway (port 8000)

## 🔐 Thông tin đăng nhập

```
Username: admin
Password: admin123
Role: ADMIN
```

## 🌐 Đăng nhập tại:

- **Admin Portal**: http://localhost:3001
- **Teacher Portal**: http://localhost:3002
- **Student Portal**: http://localhost:3003
- **Main Site**: http://localhost:3000
- **API Swagger**: http://localhost:8001/docs

## 🐛 Troubleshooting

### Lỗi: "OSError: [WinError 5] Access is denied"
**Nguyên nhân**: Auth Service vẫn đang chạy, giữ file bcrypt

**Giải pháp**: Dừng Auth Service trước (Ctrl+C)

### Lỗi: "401 Unauthorized" sau khi tạo user
**Nguyên nhân**: Bcrypt chưa được downgrade

**Giải pháp**: 
1. Kiểm tra version: `pip show bcrypt`
2. Phải là `Version: 4.1.2`
3. Nếu vẫn là 5.0.0, chạy lại bước 3

### Lỗi: "Connection refused" khi test login
**Nguyên nhân**: Auth Service hoặc API Gateway chưa chạy

**Giải pháp**:
```powershell
# Check ports
netstat -ano | findstr ":8000 :8001"

# Auth Service phải có port 8001
# API Gateway phải có port 8000
```

### Lỗi: User đã tồn tại khi chạy lại script
**Giải pháp**: Script tự động xóa user cũ trước khi tạo mới

Hoặc xóa thủ công:
```powershell
python -c "import psycopg2; conn = psycopg2.connect(host='14.161.50.86', port=25432, database='postgres', user='admin', password='Mypassword123'); cursor = conn.cursor(); cursor.execute('DELETE FROM users'); conn.commit(); cursor.close(); conn.close()"
```

## 📚 Files liên quan

- `fix-bcrypt-and-create-admin.bat` - Batch script tự động fix
- `fix-bcrypt-and-create-admin.ps1` - PowerShell script tự động fix
- `create_admin_via_api.py` - Tạo admin user qua API
- `create_admin_direct_sql.py` - Tạo admin user trực tiếp SQL (backup)
- `test_login.py` - Test login sau khi fix
- `list_users.py` - Xem danh sách users trong database

## ✨ Sau khi fix thành công

1. ✅ Admin user đã được tạo với password hash đúng
2. ✅ Login thành công qua Auth Service
3. ✅ Login thành công qua API Gateway
4. ✅ Có thể đăng nhập vào các frontend portals
5. ✅ Hệ thống sẵn sàng sử dụng

## 🎯 Next Steps

Sau khi login thành công, bạn có thể:
- Tạo thêm users (Teacher, Student)
- Test các chức năng của Admin Portal
- Kiểm tra Content Service và Assignment Service
- Tạo courses, lessons, assignments

---

**Last Updated**: 2025-10-13
**Status**: ✅ Working Solution
