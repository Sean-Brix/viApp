@echo off
REM ViApp Production Build Script for Windows
REM This script helps you build the production APK

echo ========================================
echo ViApp Production Build Script
echo ========================================
echo.

REM Check if EAS CLI is installed
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] EAS CLI not found. Installing...
    call npm install -g eas-cli
    echo [OK] EAS CLI installed
) else (
    echo [OK] EAS CLI already installed
)

echo.
echo Checking Expo login status...

REM Check if logged in
eas whoami >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Already logged in to Expo
) else (
    echo [!] Not logged in. Please login:
    call eas login
)

echo.
echo ========================================
echo Building Production APK
echo ========================================
echo.
echo This will take 10-20 minutes.
echo You'll receive an email when it's done.
echo.
set /p continue="Continue? (y/n) "

if /i "%continue%"=="y" (
    echo.
    echo [*] Starting build...
    echo.
    
    cd viApp
    call eas build --platform android --profile production
    
    echo.
    echo ========================================
    echo Build submitted!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Monitor progress: https://expo.dev
    echo 2. Check your email for completion notification
    echo 3. Download APK from the provided link
    echo 4. Distribute to users
    echo.
) else (
    echo Build cancelled.
    exit /b 0
)

pause
