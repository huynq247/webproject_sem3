#!/usr/bin/env pwsh
# ==============================================================================
# SCRIPT KHỞI ĐỘNG TẤT CẢ MICROSERVICES
# ==============================================================================
# Mô tả: Script này sẽ khởi động tất cả 3 microservices trong các cửa sổ riêng biệt
# Tác giả: Auto-generated
# Ngày tạo: 2025-10-13
# ==============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 KHỞI ĐỘNG TẤT CẢ MICROSERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Đường dẫn Python executable
$pythonExe = "D:\XProject\X1.1MicroService\.venv\Scripts\python.exe"
$baseDir = "D:\XProject\X1.1MicroService\lms_micro_services"

# Kiểm tra Python executable có tồn tại không
if (-not (Test-Path $pythonExe)) {
    Write-Host "❌ Không tìm thấy Python executable tại: $pythonExe" -ForegroundColor Red
    Write-Host "Vui lòng kiểm tra lại đường dẫn .venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Đã tìm thấy Python executable" -ForegroundColor Green
Write-Host ""

# Hàm khởi động service trong cửa sổ mới
function Start-MicroService {
    param (
        [string]$ServiceName,
        [string]$ServicePath,
        [int]$Port
    )
    
    Write-Host "🔄 Đang khởi động $ServiceName trên port $Port..." -ForegroundColor Yellow
    
    $fullPath = Join-Path $baseDir $ServicePath
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "❌ Không tìm thấy thư mục: $fullPath" -ForegroundColor Red
        return $false
    }
    
    # Khởi động service trong PowerShell window mới
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Write-Host '========================================' -ForegroundColor Cyan; " +
        "Write-Host '  $ServiceName' -ForegroundColor Green; " +
        "Write-Host '  Port: $Port' -ForegroundColor Yellow; " +
        "Write-Host '========================================' -ForegroundColor Cyan; " +
        "Write-Host ''; " +
        "Set-Location '$fullPath'; " +
        "& '$pythonExe' main.py"
    )
    
    Write-Host "✅ Đã khởi động $ServiceName trong cửa sổ mới" -ForegroundColor Green
    Write-Host ""
    return $true
}

# Khởi động từng service
Write-Host "📋 Bắt đầu khởi động các services..." -ForegroundColor Cyan
Write-Host ""

# 1. Auth Service
Start-MicroService -ServiceName "AUTH SERVICE" -ServicePath "auth-service" -Port 8001
Start-Sleep -Seconds 2

# 2. Content Service
Start-MicroService -ServiceName "CONTENT SERVICE" -ServicePath "content-service" -Port 8002
Start-Sleep -Seconds 2

# 3. Assignment Service
Start-MicroService -ServiceName "ASSIGNMENT SERVICE" -ServicePath "assignment-service" -Port 8003
Start-Sleep -Seconds 2

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ HOÀN TẤT KHỞI ĐỘNG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Đang chờ các services khởi động..." -ForegroundColor Yellow
Write-Host "Vui lòng đợi khoảng 10-15 giây để các services hoàn tất khởi động." -ForegroundColor Yellow
Write-Host ""

# Chờ 15 giây để services khởi động
Start-Sleep -Seconds 15

# Kiểm tra health của các services
Write-Host "🧪 Kiểm tra trạng thái các services..." -ForegroundColor Cyan
Write-Host ""

function Test-ServiceHealth {
    param (
        [string]$ServiceName,
        [int]$Port
    )
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$Port/health" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $ServiceName (port $Port): ONLINE" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $ServiceName (port $Port): OFFLINE hoặc chưa sẵn sàng" -ForegroundColor Red
        return $false
    }
}

# Kiểm tra từng service
$authOk = Test-ServiceHealth -ServiceName "Auth Service" -Port 8001
$contentOk = Test-ServiceHealth -ServiceName "Content Service" -Port 8002
$assignmentOk = Test-ServiceHealth -ServiceName "Assignment Service" -Port 8003

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📊 KẾT QUẢ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($authOk -and $contentOk -and $assignmentOk) {
    Write-Host "✅ Tất cả services đã sẵn sàng!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Một số services chưa sẵn sàng. Vui lòng kiểm tra các cửa sổ PowerShell." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 Truy cập API Documentation:" -ForegroundColor Cyan
Write-Host "  • Auth Service:       http://localhost:8001/docs" -ForegroundColor White
Write-Host "  • Content Service:    http://localhost:8002/docs" -ForegroundColor White
Write-Host "  • Assignment Service: http://localhost:8003/docs" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Để dừng services: Nhấn Ctrl+C trong từng cửa sổ PowerShell" -ForegroundColor Yellow
Write-Host ""
Write-Host "Nhấn phím bất kỳ để đóng cửa sổ này..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
