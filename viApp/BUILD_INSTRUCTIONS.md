# ViApp - Production Build Instructions

## Prerequisites

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo Account**
   ```bash
   eas login
   ```

## Building APK for Production

### Option 1: Using EAS Build (Recommended)

1. **Build Production APK**
   ```bash
   cd viApp
   eas build --platform android --profile production
   ```

2. **Download the APK**
   - Once the build completes, EAS will provide a download link
   - Download the APK file
   - Share it with users or install it directly on Android devices

### Option 2: Building Locally (Without EAS Build)

If you prefer to build locally:

1. **Install Android Studio and Android SDK**
   - Download from: https://developer.android.com/studio
   - Set up ANDROID_HOME environment variable

2. **Generate Android Build**
   ```bash
   cd viApp
   npx expo prebuild --platform android
   cd android
   ./gradlew assembleRelease
   ```

3. **Find APK**
   - APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Option 3: Preview Build (For Testing)

Build a preview APK for testing before production:

```bash
eas build --platform android --profile preview
```

## Post-Build Steps

### 1. Install on Android Device

**Via USB:**
```bash
adb install path/to/your-app.apk
```

**Via Download:**
- Transfer APK to device
- Open the APK file on device
- Allow installation from unknown sources if prompted
- Install the app

### 2. Test the Production Build

Verify:
- ✅ API connects to https://viapp-qq6u.onrender.com
- ✅ Login/Authentication works
- ✅ All features function correctly
- ✅ Bluetooth permissions work
- ✅ Real-time updates function
- ✅ Offline mode (if applicable)

## Production Configuration

### Current Settings

- **API URL:** `https://viapp-qq6u.onrender.com/api`
- **Package Name:** `com.sfmnhs.viapp`
- **Version:** `1.0.0`
- **Version Code:** `1`

### Environment Variables

The app automatically uses production API when built in production mode:
- Development: `__DEV__ === true` → `http://192.168.100.10:3001/api`
- Production: `__DEV__ === false` → `https://viapp-qq6u.onrender.com/api`

## Troubleshooting

### Build Fails

1. **Clear cache**
   ```bash
   npx expo start --clear
   ```

2. **Update dependencies**
   ```bash
   npm install
   ```

3. **Check EAS build logs**
   - View logs on: https://expo.dev/accounts/[your-account]/projects/viapp/builds

### APK Won't Install

1. Enable "Install from Unknown Sources" in Android settings
2. Check if package name conflicts with existing app
3. Ensure minimum Android version is met (usually Android 5.0+)

### App Crashes on Launch

1. Check if backend server is running: `https://viapp-qq6u.onrender.com/health`
2. Verify internet connectivity
3. Check Android logs: `adb logcat`

## Distribution

### For Internal Testing

1. **Upload to Google Drive/Dropbox**
   - Share download link with testers

2. **Use Firebase App Distribution**
   ```bash
   npm install -g firebase-tools
   firebase appdistribution:distribute path/to/app.apk
   ```

### For Production Release (Google Play Store)

1. **Generate App Bundle (AAB)**
   ```bash
   eas build --platform android --profile production
   ```
   (AAB is automatically generated for production builds)

2. **Sign up for Google Play Console**
   - https://play.google.com/console

3. **Create new application**
   - Upload AAB
   - Fill in store listing details
   - Submit for review

## Updating the App

### Increment Version

Before building a new version:

1. Update `version` in `app.json`:
   ```json
   "version": "1.0.1"
   ```

2. Update `versionCode` in `app.json`:
   ```json
   "android": {
     "versionCode": 2
   }
   ```

3. Rebuild:
   ```bash
   eas build --platform android --profile production
   ```

## Support

For build issues:
- Expo Documentation: https://docs.expo.dev/build/setup/
- EAS Build: https://docs.expo.dev/build/introduction/

For app issues:
- Check backend logs
- Review client-side console logs
- Test API endpoints directly
