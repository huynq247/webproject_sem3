@echo off
REM ==============================================================================
REM SCRIPT KHOI DONG TAT CA MICROSERVICES (BATCH VERSION)
REM ==============================================================================
REM Mo ta: Script nay se khoi dong tat ca 3 microservices trong cac cua so rieng biet
REM Tac gia: Auto-generated
REM Ngay tao: 2025-10-13
REM ==============================================================================

echo ========================================
echo   KHOI DONG TAT CA MICROSERVICES
echo ========================================
echo.

set PYTHON_EXE=D:\XProject\X1.1MicroService\.venv\Scripts\python.exe
set BASE_DIR=D:\XProject\X1.1MicroService\lms_micro_services

REM Kiem tra Python executable
if not exist "%PYTHON_EXE%" (
    echo [ERROR] Khong tim thay Python executable tai: %PYTHON_EXE%
    echo Vui long kiem tra lai duong dan .venv
    pause
    exit /b 1
)

echo [OK] Da tim thay Python executable
echo.

REM Khoi dong Auth Service
echo [1/3] Dang khoi dong Auth Service (port 8001)...
start "AUTH SERVICE - Port 8001" cmd /k "cd /d %BASE_DIR%\auth-service && %PYTHON_EXE% main.py"
timeout /t 2 /nobreak >nul

REM Khoi dong Content Service
echo [2/3] Dang khoi dong Content Service (port 8002)...
start "CONTENT SERVICE - Port 8002" cmd /k "cd /d %BASE_DIR%\content-service && %PYTHON_EXE% main.py"
timeout /t 2 /nobreak >nul

REM Khoi dong Assignment Service
echo [3/3] Dang khoi dong Assignment Service (port 8003)...
start "ASSIGNMENT SERVICE - Port 8003" cmd /k "cd /d %BASE_DIR%\assignment-service && %PYTHON_EXE% main.py"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   HOAN TAT KHOI DONG
echo ========================================
echo.
echo Da khoi dong tat ca services trong cac cua so rieng biet!
echo.
echo Truy cap API Documentation:
echo   - Auth Service:       http://localhost:8001/docs
echo   - Content Service:    http://localhost:8002/docs
echo   - Assignment Service: http://localhost:8003/docs
echo.
echo De dung services: Dong cac cua so CMD tuong ung
echo.
pause
