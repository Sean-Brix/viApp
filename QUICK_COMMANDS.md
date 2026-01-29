# ViApp - Quick Command Reference

## 🚀 BUILD APK

```bash
cd viApp
npm run build:android
```

**Or use the helper script:**
- Windows: `build-production.bat`
- Mac/Linux: `./build-production.sh`

---

## 📋 Prerequisites

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
```

---

## 🔧 Build Commands

```bash
# Production APK (for release)
eas build --platform android --profile production

# Preview APK (for testing)
eas build --platform android --profile preview

# Check build status
eas build:list
```

---

## 📥 Install APK

```bash
# Via USB
adb install path/to/viapp.apk

# List connected devices
adb devices

# View app logs
adb logcat | grep ViApp
```

---

## 🧪 Test Backend

```bash
# Health check
curl https://viapp-qq6u.onrender.com/health

# Test login
curl -X POST https://viapp-qq6u.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🔄 Update Version

Edit `viApp/app.json`:
```json
"version": "1.0.1",
"android": {
  "versionCode": 2
}
```

Then rebuild:
```bash
npm run build:android
```

---

## 📚 Documentation

- `BUILD_INSTRUCTIONS.md` - Full build guide
- `PRODUCTION_DEPLOYMENT.md` - Deployment checklist  
- `USER_INSTALLATION_GUIDE.md` - User instructions
- `PRODUCTION_READY.md` - Summary

---

## 🌐 Production URLs

- **Backend:** https://viapp-qq6u.onrender.com
- **API:** https://viapp-qq6u.onrender.com/api
- **Health:** https://viapp-qq6u.onrender.com/health
- **Build Monitor:** https://expo.dev

---

## ⚡ Quick Test

```bash
# 1. Build
cd viApp && npm run build:android

# 2. Wait ~15 minutes

# 3. Download APK from expo.dev

# 4. Install
adb install viapp.apk

# 5. Test on device
```

---

**Need help? Check PRODUCTION_READY.md**
