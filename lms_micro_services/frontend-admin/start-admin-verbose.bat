@echo off
echo Starting Frontend Admin...
cd /d "d:\XProject\X1.1MicroService\lms_micro_services\frontend-admin"
echo Current directory: %CD%
echo.
echo Checking package.json...
if exist package.json (
    echo package.json found
) else (
    echo ERROR: package.json not found!
    pause
    exit /b 1
)
echo.
echo Starting with verbose output...
set GENERATE_SOURCEMAP=false
set SKIP_PREFLIGHT_CHECK=true
npm start --verbose
pause
