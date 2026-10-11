Write-Host "Phishing Scutum setup" -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Error "Node.js 20+ is required."; exit 1 }
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
npm run install:all
Write-Host "Starting frontend + backend..." -ForegroundColor Green
npm run dev
