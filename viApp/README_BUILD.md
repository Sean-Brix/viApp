# ViApp - Quick Build Guide

## 🚀 Build APK in 3 Steps

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Build Production APK
```bash
cd viApp
npm run build:android
```

Or use the full command:
```bash
eas build --platform android --profile production
```

## ⏱️ Build Time
- Typical build time: 10-20 minutes
- You'll receive an email when it's done
- Or monitor progress at: https://expo.dev

## 📥 Download APK
After build completes:
1. Check your email for the download link
2. Or visit: https://expo.dev/accounts/[your-account]/projects/viapp/builds
3. Download the APK file
4. Distribute to users

## 🔧 Alternative: Preview Build (For Testing)
```bash
npm run build:preview
```

## 📱 Install on Device

**Via USB:**
```bash
adb install path/to/app.apk
```

**Via Download:**
1. Transfer APK to Android device
2. Open APK file
3. Allow installation from unknown sources
4. Install

## ✅ Production Settings

- **API URL:** https://viapp-qq6u.onrender.com/api
- **Package:** com.sfmnhs.viapp
- **Version:** 1.0.0

## 📚 Full Documentation

- [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) - Detailed build guide
- [PRODUCTION_DEPLOYMENT.md](../PRODUCTION_DEPLOYMENT.md) - Deployment checklist
- [USER_INSTALLATION_GUIDE.md](./USER_INSTALLATION_GUIDE.md) - End-user guide

## 🆘 Need Help?

- EAS Build Docs: https://docs.expo.dev/build/introduction/
- Expo Forums: https://forums.expo.dev/

## 🔄 Update Version

Before building a new version:

1. Update `version` in `app.json`:
   ```json
   "version": "1.0.1"
   ```

2. Update `versionCode`:
   ```json
   "android": {
     "versionCode": 2
   }
   ```

3. Rebuild with the same command

---

**Ready to build? Run:** `npm run build:android`
