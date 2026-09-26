@echo off
title NexusCRM - Enterprise SaaS Frontend (React 19 + TypeScript)
cd /d "%~dp0"
echo ===============================================================
echo   NexusCRM - Modern SaaS CRM (React 19 + TypeScript + Vite)
echo ===============================================================
if not exist "node_modules" (
  echo [1/2] Installing dependencies...
  call npm install
)
echo [2/2] Starting Vite development server at http://localhost:5173 ...
call npm run dev
pause
