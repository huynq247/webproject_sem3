@echo off
echo Starting Frontend Admin on different port...
cd /d "d:\XProject\X1.1MicroService\lms_micro_services\frontend-admin"
set PORT=3002
set SKIP_PREFLIGHT_CHECK=true
set GENERATE_SOURCEMAP=false
echo Starting on port %PORT%...
npm start
pause
