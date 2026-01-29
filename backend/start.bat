@echo off
title ViApp Backend Server
color 0A

cd /d %~dp0

echo.
echo ========================================
echo      ViApp Backend Server Starter
echo ========================================
echo.

:: Check if dist folder exists
if not exist "dist" (
    echo [INFO] Building project...
    call npm run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
)

:: Start the server
echo.
echo [INFO] Starting server on port 3001...
echo [INFO] Press Ctrl+C to stop the server
echo.

node dist/server.js

:: If server stops, pause so user can see errors
echo.
echo [INFO] Server stopped
pause
