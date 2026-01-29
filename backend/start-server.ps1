# Start ViApp Backend Server
# Run this with: powershell -ExecutionPolicy Bypass -File start-server.ps1

Write-Host "🚀 Starting ViApp Backend Server..." -ForegroundColor Green

# Navigate to backend directory
Set-Location $PSScriptRoot

# Kill any existing node processes on port 3001
Write-Host "📋 Checking for existing processes on port 3001..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "⚠️  Found process $process using port 3001, stopping it..." -ForegroundColor Yellow
    Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Build the project
Write-Host "🔨 Building TypeScript..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the server
Write-Host "🎯 Starting server on port 3001..." -ForegroundColor Green
Write-Host ""

# Start node as a separate process
Start-Process -FilePath "node" -ArgumentList "dist/server.js" -NoNewWindow -Wait

Read-Host "Press Enter to exit"
