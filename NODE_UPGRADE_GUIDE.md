# 🔧 Node.js Upgrade & Build Fix Guide

## ⚠️ Problem
Your current Node.js version is **v18.18.0**, but React Native 0.83.1 and Expo 54 require **Node.js >= 20.19.4**.

## ✅ Solution 1: Upgrade Node.js (Recommended)

### Step 1: Download Node.js 20 LTS

1. Go to: https://nodejs.org/
2. Download **Node.js 20.x LTS** (Long Term Support)
3. Or download directly: https://nodejs.org/dist/v20.19.4/node-v20.19.4-x64.msi

### Step 2: Install Node.js

1. Run the installer
2. Follow the installation wizard
3. **Important:** Check "Automatically install necessary tools" during installation

### Step 3: Verify Installation

Open a **NEW** PowerShell window (close old ones):

```powershell
node --version
# Should show: v20.19.4 or higher

npm --version
# Should show: 10.x.x or higher
```

### Step 4: Rebuild Project

```powershell
cd C:\Users\kcsea\CODE\ViApp\viApp

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install

# Verify expo is installed
npm list expo
```

### Step 5: Build for Production

```powershell
eas build --platform android --profile production
```

---

## ✅ Solution 2: Quick Build (If You Can't Upgrade Node.js Now)

If you can't upgrade Node.js immediately, use EAS Build (which runs in the cloud with the correct Node.js version):

### Option A: Use Web Dashboard

1. Go to: https://expo.dev/
2. Login with your account (sean-brix)
3. Select your project: **viapp**
4. Click "Builds" → "Create Build"
5. Select: **Android** → **Production profile**
6. Click "Build"

### Option B: Force EAS Build (Skip Local Checks)

```powershell
cd C:\Users\kcsea\CODE\ViApp\viApp

# This bypasses local validation
eas build --platform android --profile production --clear-cache
```

---

## 🚀 After Node.js Upgrade: Complete Build Process

### 1. Clean Everything

```powershell
cd C:\Users\kcsea\CODE\ViApp

# Frontend cleanup
cd viApp
Remove-Item -Recurse -Force node_modules, .expo, android, ios -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install

# Backend cleanup
cd ..\backend
Remove-Item -Recurse -Force node_modules, dist -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npm run build
```

### 2. Start Backend (For Testing)

```powershell
cd C:\Users\kcsea\CODE\ViApp\backend
npm run dev
```

### 3. Build Production APK

```powershell
cd C:\Users\kcsea\CODE\ViApp\viApp
eas build --platform android --profile production
```

**Build Progress:**
- ⏳ Build will take 15-25 minutes
- 📧 You'll receive an email when done
- 🔗 Download link will be provided
- 📊 Monitor at: https://expo.dev/accounts/sean-brix/projects/viapp/builds

---

## 📱 Alternative: Build APK Locally (After Node.js Upgrade)

If you prefer to build locally instead of using EAS:

### Prerequisites
- Node.js 20+ installed ✅
- Android Studio installed
- Android SDK configured
- Java JDK 17+ installed

### Build Steps

```powershell
cd C:\Users\kcsea\CODE\ViApp\viApp

# Generate native Android project
npx expo prebuild --platform android --clean

# Build APK
cd android
.\gradlew assembleRelease

# Find APK at:
# android\app\build\outputs\apk\release\app-release.apk
```

---

## 🔍 Troubleshooting

### Issue: "npm not recognized"
**Solution:** Restart your computer after installing Node.js

### Issue: "eas command not found"
**Solution:**
```powershell
npm install -g eas-cli
```

### Issue: "Build still fails with Node.js errors"
**Solution:**
```powershell
# Check Node.js version
node --version

# Must be 20.19.4 or higher
# If still old, close ALL terminals and open new ones
```

### Issue: "Expo SDK version mismatch"
**Solution:**
```powershell
cd C:\Users\kcsea\CODE\ViApp\viApp
npm install expo@latest
npx expo install --fix
```

### Issue: "Android build fails locally"
**Solution:** Use EAS Build instead (it's easier and handles everything):
```powershell
eas build --platform android --profile production
```

---

## 📋 Quick Command Reference

### Check Versions
```powershell
node --version    # Should be >= 20.19.4
npm --version     # Should be >= 10.x.x
eas --version     # Should be latest
```

### Install Tools
```powershell
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Check login status
eas whoami
```

### Build Commands
```powershell
# Production build
eas build --platform android --profile production

# Preview build (for testing)
eas build --platform android --profile preview

# Check build status
eas build:list
```

---

## ✅ Recommended Path for You

**Best option:** Upgrade to Node.js 20, then use EAS Build

### Why?
1. ✅ **Node.js 20 Required**: React Native 0.83.1 needs it
2. ✅ **EAS Build is Easier**: No Android Studio setup needed
3. ✅ **Cloud Building**: Handles all dependencies automatically
4. ✅ **Automatic Signing**: APK is signed and ready to distribute
5. ✅ **Consistent Builds**: Same environment every time

### Steps:
1. Install Node.js 20: https://nodejs.org/
2. Restart computer
3. Open new terminal
4. Run: `cd C:\Users\kcsea\CODE\ViApp\viApp`
5. Run: `npm install`
6. Run: `eas build --platform android --profile production`
7. Wait 15-20 minutes ☕
8. Download APK from email link

---

## 🎯 Your Project Status

### ✅ What's Ready
- Backend: Compiled and deployed
- Frontend: Code complete
- Features: All implemented
- Configuration: Production ready

### ⚠️ What's Needed
- Node.js upgrade to v20+
- Run EAS build
- Download APK

**Estimated Time to Production:** 30 minutes (including Node.js install)

---

## 📞 Need Help?

If you encounter issues:
1. Check Node.js version first: `node --version`
2. Make sure you're using a NEW terminal window
3. Clear npm cache: `npm cache clean --force`
4. Try EAS web dashboard if CLI fails
5. Check build logs at: https://expo.dev/accounts/sean-brix/projects/viapp/builds

---

**Next Step:** Download and install Node.js 20 from https://nodejs.org/
