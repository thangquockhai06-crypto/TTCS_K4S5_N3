@echo off
title NexusCRM - Fullstack Launcher (Frontend + Backend)
cd /d "%~dp0"
echo ===============================================================
echo   NexusCRM Fullstack System Launcher
echo   Backend Server:  http://localhost:8000
echo   Frontend Web:    http://localhost:5173
echo ===============================================================

echo [1/2] Khoi dong Python Backend Server (Port 8000)...
start "NexusCRM Backend (Port 8000)" cmd /k "cd /d \"%~dp0server\" && python run.py"

echo [2/2] Khoi dong React Frontend (Port 5173)...
call npm run dev
pause
