@echo off
title TataDana - Fast Launcher
echo ===================================================
echo     MEMULAI TATADANA (FINTECH SAAS INDONESIA)
echo ===================================================
echo.

set "PATH=C:\Users\lenovo\.nodejs\node-v20.18.0-win-x64;%PATH%"
cd /d "%~dp0"

if not exist ".env.local" (
    echo [1/3] Menyiapkan .env.local...
    copy .env.example .env.local >nul
)

echo [2/4] Memulai Telegram Bridge Daemon (@rayshaa_bot)...
start "TataDana Telegram Bridge" cmd /k "node scripts/telegram-bridge.mjs"

echo [3/4] Menjalankan server Next.js (http://localhost:3000)...
echo.
echo ===================================================
echo  - Landing Page : http://localhost:3000
echo  - Dashboard    : http://localhost:3000/dashboard
echo  - Bot Simulator: http://localhost:3000/dashboard/simulator
echo  - Superadmin   : http://localhost:3000/admin
echo  - Telegram Bot : @rayshaa_bot (Live Polling Active)
echo ===================================================
echo.

start http://localhost:3000
call npm run dev
