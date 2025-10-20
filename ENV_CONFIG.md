# Sử dụng .env cho cấu hình
# HƯỚNG DẪN SỬ DỤNG:
# 1. Copy file .env.example thành .env
# 2. Điều chỉnh các giá trị trong file .env theo môi trường triển khai
# 3. Khởi động lại container với lệnh docker-compose down && docker-compose up -d

# GHI CHÚ QUAN TRỌNG:
# SERVER_HOST phải là địa chỉ IP hoặc hostname của máy chủ mà người dùng có thể truy cập được
# SERVER_PORT là port mà người dùng sẽ truy cập vào hệ thống (80 hoặc 443 cho production)
# API_GATEWAY_PORT là port nội bộ của API Gateway container (thường là 8000)

# CÁC VẤN ĐỀ THƯỜNG GẶP:
# - ERR_CONNECTION_REFUSED: Kiểm tra SERVER_HOST và SERVER_PORT có đúng không
# - Frontend không kết nối được API: Đảm bảo API_GATEWAY_URL đúng và có thể truy cập từ bên ngoài