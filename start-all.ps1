# Start All Services - PowerShell Script
# Starts both backend and frontend in separate windows

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Duplicate Files Manager Startup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$ROOT_DIR = Get-Location

# Backend directory
$BACKEND_DIR = Join-Path $ROOT_DIR "backend\dupilcate-files-manager"

# Frontend directory
$FRONTEND_DIR = Join-Path $ROOT_DIR "frontend\duplicate-files-web-ui"

# Check if directories exist
if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "Error: Backend directory not found at $BACKEND_DIR" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Host "Error: Frontend directory not found at $FRONTEND_DIR" -ForegroundColor Red
    exit 1
}

# Start Backend
Write-Host "Starting Backend (Spring Boot)..." -ForegroundColor Yellow
Write-Host "Location: $BACKEND_DIR" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACKEND_DIR'; Write-Host 'Starting Spring Boot Backend...' -ForegroundColor Green; .\mvnw.cmd spring-boot:run"

Write-Host "✓ Backend starting in new window" -ForegroundColor Green
Write-Host "  URL: http://localhost:8080" -ForegroundColor Gray
Write-Host ""

# Wait a moment before starting frontend
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend (Next.js)..." -ForegroundColor Yellow
Write-Host "Location: $FRONTEND_DIR" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FRONTEND_DIR'; Write-Host 'Starting Next.js Frontend...' -ForegroundColor Green; npm run dev"

Write-Host "✓ Frontend starting in new window" -ForegroundColor Green
Write-Host "  URL: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

# Instructions
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Services Starting" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Two new windows have been opened:" -ForegroundColor White
Write-Host "  1. Backend (Spring Boot) - Port 8080" -ForegroundColor Gray
Write-Host "  2. Frontend (Next.js) - Port 3000" -ForegroundColor Gray
Write-Host ""
Write-Host "Wait for both services to start, then:" -ForegroundColor Yellow
Write-Host "  • Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "  • Check backend: http://localhost:8080/api/health" -ForegroundColor White
Write-Host ""
Write-Host "To stop services:" -ForegroundColor Yellow
Write-Host "  • Close the PowerShell windows" -ForegroundColor White
Write-Host "  • Or press Ctrl+C in each window" -ForegroundColor White
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Wait for user input
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
