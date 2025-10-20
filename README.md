# LMS Microservices

Hệ thống Quản lý Học tập (LMS) với kiến trúc Microservices.

## Tổng quan

Hệ thống LMS bao gồm các microservices sau:

- **API Gateway**: Điểm truy cập trung tâm cho tất cả các services
- **Auth Service**: Xác thực và phân quyền người dùng
- **Content Service**: Quản lý nội dung học tập
- **Assignment Service**: Quản lý bài tập và đánh giá
- **Frontend Admin**: Giao diện cho quản trị viên
- **Frontend Teacher**: Giao diện cho giáo viên
- **Frontend Student**: Giao diện cho học viên

## Triển khai

### Triển khai trên Docker

Xem hướng dẫn triển khai chi tiết:
- [Hướng dẫn triển khai trên RedHat](REDHAT_DEPLOYMENT_GUIDE.md)
- [Hướng dẫn triển khai nhanh](README-DEPLOYMENT.md)

### Khắc phục sự cố

- [Khắc phục lỗi build frontend](FRONTEND_BUILD_TROUBLESHOOTING.md)
- [Khắc phục lỗi backend trên Docker](DOCKER_BACKEND_TROUBLESHOOTING.md)

## Phát triển

Để phát triển và chạy ứng dụng cục bộ, vui lòng tham khảo:
- [Hướng dẫn chạy Backend](lms_micro_services/BACKEND_STARTUP_GUIDE.md)