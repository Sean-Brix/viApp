# ViApp - Complete Production Build Guide

## 🎯 Pre-Build Checklist

### ✅ Backend Checklist
- [x] All TypeScript errors fixed
- [x] Database migrations up to date
- [x] Environment variables configured
- [x] API endpoints tested
- [x] WebSocket connections working
- [x] Emergency contact management implemented
- [x] Profile settings complete

### ✅ Frontend Checklist
- [x] All components compiling
- [x] API client configured for production
- [x] Production URL set: `https://viapp-qq6u.onrender.com/api`
- [x] All features tested
- [x] Profile settings with emergency contacts
- [x] Real-time polling (5-second intervals)
- [x] Medical history CRUD
- [x] Dynamic health status

## 📦 Production Build Steps

### Step 1: Backend Production Build

```powershell
# Navigate to backend
cd C:\Users\kcsea\CODE\ViApp\backend

# Install dependencies (if needed)
npm install

# Generate Prisma Client
npm run prisma:generate

# Build TypeScript to JavaScript
npm run build

# The compiled JavaScript will be in ./dist folder
```

**Backend is ready for deployment to Render.com** ✅

### Step 2: Frontend Production Build

#### Option A: EAS Build (Recommended - Online Build)

1. **Install EAS CLI** (if not installed)
```powershell
npm install -g eas-cli
```

2. **Login to Expo**
```powershell
cd C:\Users\kcsea\CODE\ViApp\viApp
eas login
```

3. **Build Production APK**
```powershell
eas build --platform android --profile production
```

**Build Time:** 15-25 minutes
**Output:** Download link for APK file will be emailed to you

#### Option B: Local Build (Alternative - Offline Build)

1. **Prerequisites**
   - Android Studio installed
   - Android SDK configured
   - ANDROID_HOME environment variable set

2. **Prebuild**
```powershell
cd C:\Users\kcsea\CODE\ViApp\viApp
npx expo prebuild --platform android --clean
```

3. **Build APK**
```powershell
cd android
.\gradlew assembleRelease
```

4. **Find APK**
   - Location: `android/app/build/outputs/apk/release/app-release.apk`

### Step 3: Quick Build Script (Windows)

Use the provided script:
```powershell
cd C:\Users\kcsea\CODE\ViApp
.\build-production.bat
```

## 🚀 Deployment

### Backend Deployment (Render.com)

Your backend is already deployed at:
- **URL:** https://viapp-qq6u.onrender.com
- **API:** https://viapp-qq6u.onrender.com/api
- **Health Check:** https://viapp-qq6u.onrender.com/health

**Auto-Deploy:** Render automatically builds and deploys when you push to GitHub.

To redeploy manually:
1. Go to https://dashboard.render.com
2. Select your viapp-backend service
3. Click "Manual Deploy" → "Deploy latest commit"

### Frontend Distribution

#### Method 1: Direct APK Installation

1. **Download APK** from EAS build
2. **Transfer to Android devices** via:
   - USB cable
   - Email attachment
   - Cloud storage (Google Drive, Dropbox)
   - File sharing apps

3. **Install on device:**
   - Open APK file
   - Allow installation from unknown sources
   - Install the app

#### Method 2: Google Play Store (Future)

For official distribution:
1. Create Google Play Developer account ($25 one-time fee)
2. Build AAB instead of APK:
   ```powershell
   eas build --platform android --profile production
   ```
   (Update eas.json to build AAB)
3. Upload to Google Play Console
4. Complete store listing
5. Submit for review

## 📱 Testing Production Build

### Backend Testing

1. **Health Check**
```powershell
curl https://viapp-qq6u.onrender.com/health
```

2. **API Test**
```powershell
curl https://viapp-qq6u.onrender.com/api
```

3. **WebSocket Test**
- Open app and login
- Check real-time updates
- Verify 5-second polling

### Frontend Testing

Install APK and verify:
- ✅ Login/Authentication
- ✅ Student Dashboard (real-time updates)
- ✅ Admin Dashboard (real-time updates)
- ✅ Profile Settings (all fields + emergency contacts)
- ✅ Medical History (CRUD operations)
- ✅ Alerts Screen
- ✅ Device Management
- ✅ Vital Signs monitoring
- ✅ WebSocket connections
- ✅ API connectivity

## 🔧 Production Configuration

### Current Settings

**App Configuration:**
- **Name:** ViApp
- **Package:** com.sfmnhs.viapp
- **Version:** 1.0.0
- **Version Code:** 1

**API Configuration:**
- **Production API:** https://viapp-qq6u.onrender.com/api
- **Development API:** http://192.168.100.10:3001/api
- **Auto-detection:** Based on `__DEV__` flag

**Features:**
- Real-time WebSocket updates
- 5-second background polling
- Emergency contact management
- Complete profile settings
- Medical history tracking
- Dynamic health status calculation
- Alert system with notifications

## 📊 Build Information

### Backend Build Output
- **Location:** `backend/dist/`
- **Entry Point:** `dist/server.js`
- **Environment:** Node.js + Express
- **Database:** MySQL (hosted on Render)

### Frontend Build Output
- **Type:** APK (Android Package)
- **Size:** ~50-80 MB
- **Min Android:** 5.0 (API 21)
- **Target Android:** 14.0 (API 34)
- **Architecture:** Universal (ARM, x86)

## 🎉 Post-Build Checklist

### Backend
- [ ] Server running on Render.com
- [ ] Database connected and migrated
- [ ] All API endpoints responding
- [ ] WebSocket server working
- [ ] Logs monitored

### Frontend
- [ ] APK built successfully
- [ ] APK installed on test device
- [ ] All features tested
- [ ] No crashes or errors
- [ ] API connectivity confirmed
- [ ] Real-time updates working

### Distribution
- [ ] APK signed (automatic with EAS)
- [ ] APK shared with team/users
- [ ] Installation instructions provided
- [ ] Support documentation ready

## 📱 Installation Instructions for Users

### For Students and Staff

1. **Download the App**
   - You will receive a link to download ViApp
   - Or: Transfer the APK file to your Android phone

2. **Enable Installation**
   - Go to: Settings → Security
   - Enable: "Install unknown apps" or "Unknown sources"
   - Allow installation from your file manager or browser

3. **Install ViApp**
   - Open the APK file
   - Tap "Install"
   - Wait for installation to complete

4. **First Launch**
   - Open ViApp
   - Login with your credentials
   - Grant required permissions (Bluetooth, Location)
   - Start monitoring your health!

### Login Credentials

**Students:**
- Username provided by school
- Default password (change on first login)

**Admin/Staff:**
- Username: Your staff username
- Password: Provided by IT admin

## 🔄 Updating the App

### Backend Updates
- Push code to GitHub
- Render automatically deploys
- No downtime for users

### Frontend Updates
1. Increment version in `app.json`:
   ```json
   {
     "version": "1.0.1",
     "android": {
       "versionCode": 2
     }
   }
   ```

2. Build new APK:
   ```powershell
   eas build --platform android --profile production
   ```

3. Distribute new APK to users

## 🐛 Troubleshooting

### Build Issues

**EAS Build Fails:**
- Check expo account login: `eas whoami`
- Verify eas.json configuration
- Check build logs in Expo dashboard

**Backend Build Fails:**
- Fix TypeScript errors: `npm run build`
- Check Prisma schema: `npm run prisma:generate`
- Verify dependencies: `npm install`

### Runtime Issues

**App Won't Connect to API:**
- Verify backend is running
- Check API URL in code
- Test with curl/Postman

**WebSocket Not Working:**
- Check server logs
- Verify JWT token
- Check network connectivity

**Real-time Updates Not Working:**
- Check polling intervals (should be 5 seconds)
- Verify WebSocket connection
- Check browser console for errors

## 📞 Support

For technical support:
- **Backend Issues:** Check Render logs
- **Frontend Issues:** Check device logs with `adb logcat`
- **General Questions:** Contact development team

## 🎯 Production Readiness Score

**Backend:** ✅ 100% Ready
**Frontend:** ✅ 100% Ready  
**Features:** ✅ All Implemented
**Testing:** ✅ Completed
**Documentation:** ✅ Complete

**Status: READY FOR PRODUCTION DEPLOYMENT** 🚀

---

Built with ❤️ for SFMNHS Health Monitoring System
