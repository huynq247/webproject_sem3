#!/usr/bin/env pwsh
# ==============================================================================
# SCRIPT DỪNG TẤT CẢ MICROSERVICES
# ==============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🛑 DỪNG TẤT CẢ MICROSERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Tìm tất cả Python processes
Write-Host "🔍 Đang tìm các Python processes..." -ForegroundColor Yellow
Write-Host ""

$pythonProcesses = Get-Process -Name python -ErrorAction SilentlyContinue

if ($pythonProcesses) {
    Write-Host "Tìm thấy $($pythonProcesses.Count) Python process(es):" -ForegroundColor Cyan
    $pythonProcesses | Format-Table -Property Id, ProcessName, StartTime -AutoSize
    
    Write-Host ""
    Write-Host "🛑 Đang dừng tất cả Python processes..." -ForegroundColor Yellow
    
    try {
        $pythonProcesses | Stop-Process -Force -ErrorAction Stop
        Write-Host "✅ Đã dừng thành công tất cả Python processes" -ForegroundColor Green
    } catch {
        Write-Host "❌ Có lỗi khi dừng processes: $_" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  Không tìm thấy Python process nào đang chạy" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Kiểm tra các ports..." -ForegroundColor Yellow
Write-Host ""

# Kiểm tra các ports
$ports = @(8001, 8002, 8003)
$portsInUse = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $portsInUse += $port
        Write-Host "⚠️  Port $port vẫn đang được sử dụng" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Port $port đã được giải phóng" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📊 KẾT QUẢ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($portsInUse.Count -eq 0) {
    Write-Host "✅ Tất cả services đã được dừng thành công" -ForegroundColor Green
    Write-Host "✅ Tất cả ports đã được giải phóng" -ForegroundColor Green
} else {
    Write-Host "⚠️  Một số ports vẫn đang được sử dụng: $($portsInUse -join ', ')" -ForegroundColor Yellow
    Write-Host "Bạn có thể cần dừng thủ công hoặc khởi động lại máy" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Nhấn phím bất kỳ để đóng cửa sổ này..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
