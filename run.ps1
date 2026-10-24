Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    MEMULAI TATADANA (FINTECH SAAS INDONESIA)" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

if (Test-Path "C:\Users\lenovo\.nodejs\node-v20.18.0-win-x64") {
    $env:PATH = "C:\Users\lenovo\.nodejs\node-v20.18.0-win-x64;$env:PATH"
}

if (-not (Test-Path ".env.local")) {
    Write-Host "[1/3] Menyiapkan .env.local..." -ForegroundColor Green
    Copy-Item ".env.example" ".env.local"
} else {
    Write-Host "[1/3] File .env.local siap." -ForegroundColor Gray
}

if (-not (Test-Path "node_modules")) {
    Write-Host "[2/3] Memasang dependensi (npm install)..." -ForegroundColor Green
    npm install
} else {
    Write-Host "[2/3] Dependensi sudah terpasang." -ForegroundColor Gray
}

Write-Host "[3/4] Menjalankan Telegram Bridge Daemon (@rayshaa_bot)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "if (Test-Path 'C:\Users\lenovo\.nodejs\node-v20.18.0-win-x64') { `$env:PATH = 'C:\Users\lenovo\.nodejs\node-v20.18.0-win-x64;' + `$env:PATH }; Set-Location '$PSScriptRoot'; node scripts/telegram-bridge.mjs"

Write-Host "[4/4] Menjalankan server aplikasi Next.js..." -ForegroundColor Green
Write-Host ""
Write-Host "  Landing Page : http://localhost:3000" -ForegroundColor White
Write-Host "  Dashboard    : http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "  Simulator    : http://localhost:3000/dashboard/simulator" -ForegroundColor White
Write-Host "  Superadmin   : http://localhost:3000/admin" -ForegroundColor White
Write-Host "  Bot Telegram : @rayshaa_bot (Live Polling Active)" -ForegroundColor White
Write-Host ""

Start-Process "http://localhost:3000"
npm run dev
