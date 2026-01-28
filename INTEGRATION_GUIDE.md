# ViApp Frontend Integration Guide

## 🎉 Completed Integration Tasks

### Task 13: API Service Layer ✅
Created a complete API service layer for backend communication:

#### Files Created:
1. **`src/services/api/client.ts`** - Axios client with interceptors
   - Automatic token management
   - Token refresh on 401 errors
   - Request/response interceptors
   - Base URL configuration

2. **`src/services/api/auth.service.ts`** - Authentication API
   - `login()` - User login
   - `register()` - User registration
   - `logout()` - User logout
   - `refreshToken()` - Token refresh

3. **`src/services/api/student.service.ts`** - Student API
   - `getProfile()` - Get student profile
   - `updateProfile()` - Update profile
   - `getLatestVitals()` - Get latest vitals
   - `getVitalsHistory()` - Get vitals history
   - `getAlerts()` - Get student alerts
   - `acknowledgeAlert()` - Acknowledge alert
   - `getNotificationSettings()` - Get notification settings
   - `updateNotificationSettings()` - Update settings

4. **`src/services/api/admin.service.ts`** - Admin API
   - `getStudents()` - List all students
   - `getStudentById()` - Get student details
   - `createStudent()` - Create new student
   - `updateStudent()` - Update student
   - `deactivateStudent()` - Deactivate student
   - `getAlerts()` - Get all alerts
   - `acknowledgeAlert()` - Acknowledge alert
   - `resolveAlert()` - Resolve alert
   - `registerDevice()` - Register new device
   - `assignDevice()` - Assign device to student
   - `unassignDevice()` - Unassign device
   - `getDevices()` - List all devices

5. **`src/services/api/vital.service.ts`** - Vitals API
   - `uploadVital()` - Upload single vital reading
   - `bulkUploadVitals()` - Bulk upload for offline sync

6. **`src/services/api/index.ts`** - Centralized exports

#### Offline Support:
7. **`src/services/offline-queue.service.ts`**
   - Queue management for offline data
   - Automatic retry mechanism
   - Background processing when online

8. **`src/services/network.service.ts`**
   - Network status monitoring
   - Automatic queue processing on reconnection
   - Event listeners for network changes

### Task 14: Authentication Integration ✅
Updated **`app/components/LoginScreen.tsx`**:
- ✅ Integrated with backend API via `authService.login()`
- ✅ Automatic token storage in AsyncStorage
- ✅ Loading state with spinner
- ✅ Error handling and display
- ✅ Role-based routing (admin vs student)
- ✅ Disabled button during loading

### Task 15: Dashboard Backend Integration ✅
Created **`app/components/DashboardContainer.tsx`**:
- ✅ Fetches students from backend via `adminService.getStudents()`
- ✅ Real-time data transformation
- ✅ Automatic refresh every 30 seconds
- ✅ Pull-to-refresh support
- ✅ Search and filter functionality
- ✅ Loading states and error handling

### Task 16: Alerts Backend Integration ✅
Created **`app/components/AlertsContainer.tsx`**:
- ✅ Fetches alerts from backend via `adminService.getAlerts()`
- ✅ Auto-refresh every 30 seconds
- ✅ Filters for unacknowledged/unresolved alerts
- ✅ Severity mapping (CRITICAL/HIGH/MEDIUM/LOW)
- ✅ Real-time timestamp formatting

## 📦 New Dependencies Installed

```bash
npm install axios @react-native-async-storage/async-storage @react-native-community/netinfo --legacy-peer-deps
```

- **axios** - HTTP client for API calls
- **@react-native-async-storage/async-storage** - Local storage for tokens
- **@react-native-community/netinfo** - Network status monitoring

## 🔧 Configuration

### API Base URL
Edit `src/services/api/client.ts` to configure the API endpoint:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' // Development - use your local IP for real devices
  : 'https://your-production-api.com/api'; // Production
```

**For testing on real devices or emulators:**
Replace `localhost` with your computer's IP address:
```typescript
'http://192.168.1.100:3000/api' // Replace with your actual IP
```

## 🚀 Usage Examples

### Authentication
```typescript
import { authService } from '@/src/services/api';

// Login
const response = await authService.login({
  username: 'admin',
  password: 'admin123'
});

// Logout
await authService.logout();
```

### Fetching Student Data
```typescript
import { studentService } from '@/src/services/api';

// Get profile
const profile = await studentService.getProfile();

// Get latest vitals
const vitals = await studentService.getLatestVitals();

// Get alerts
const alerts = await studentService.getAlerts({
  page: 1,
  limit: 20,
  severity: 'HIGH'
});
```

### Admin Operations
```typescript
import { adminService } from '@/src/services/api';

// Get all students
const students = await adminService.getStudents({
  page: 1,
  limit: 50,
  search: 'maria'
});

// Create student
const newStudent = await adminService.createStudent({
  username: 'john.doe',
  email: 'john@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '2005-01-15',
  gender: 'MALE'
});

// Assign device
await adminService.assignDevice('device-id', 'student-id');
```

### Offline Queue
```typescript
import offlineQueueService from '@/src/services/offline-queue.service';
import vitalService from '@/src/services/api/vital.service';

// Add to queue if offline
if (!navigator.onLine) {
  await offlineQueueService.addToQueue('VITAL_UPLOAD', vitalData);
} else {
  await vitalService.uploadVital(vitalData);
}

// Process queue when online
await offlineQueueService.processQueue();
```

## 🔄 Auto-Sync Features

### Network Monitoring
The app automatically monitors network status and processes the offline queue when connection is restored:

```typescript
// Initialized in App.tsx
import networkService from '@/src/services/network.service';

useEffect(() => {
  networkService.init();
  return () => networkService.cleanup();
}, []);
```

### Token Refresh
The API client automatically refreshes tokens when they expire (401 errors):
- Intercepts 401 responses
- Calls refresh token endpoint
- Retries original request with new token
- Clears auth if refresh fails

## 📱 Component Integration

### Using DashboardContainer
```typescript
import { DashboardContainer } from './components/DashboardContainer';

<DashboardContainer
  onStudentClick={(student) => {
    // Navigate to student detail
  }}
  onAddStudent={() => {
    // Navigate to add student form
  }}
/>
```

### Using AlertsContainer
```typescript
import { AlertsContainer } from './components/AlertsContainer';

<AlertsContainer
  onBack={() => {
    // Navigate back
  }}
/>
```

## 🧪 Testing

### Test Credentials (From Backend Seed)
**Admin:**
- Username: `admin`
- Password: `admin123`

**Students:**
- Username: `maria.santos`, `john.reyes`, `ana.cruz`
- Password: `student123` (for all)

### Test API Endpoints
Before running the app, ensure backend is running:
```bash
cd backend
npm run dev
```

Test health endpoint:
```bash
curl http://localhost:3000/health
```

## ⚠️ Known Issues & Solutions

### Issue 1: Backend Not Running
**Solution:** Follow `backend/TESTING_GUIDE.md` to start the backend server

### Issue 2: Cannot connect from device/emulator
**Solution:** Update API_BASE_URL to use your computer's IP instead of localhost

### Issue 3: CORS errors
**Solution:** Backend CORS is configured for common Expo dev URLs. Add your IP to `.env` ALLOWED_ORIGINS if needed

## 📋 Remaining Tasks

- [ ] Task 17: Build device registration and student management UI
- [ ] Task 18: Implement comprehensive offline caching
- [ ] Task 19: Enhanced sync queue with conflict resolution
- [ ] Task 20: End-to-end testing and bug fixes

## 🎯 Next Steps

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Update API URL** in `src/services/api/client.ts` if testing on device

3. **Start Expo Dev Server**
   ```bash
   cd viApp
   npm start
   ```

4. **Test Login**
   - Use credentials: `admin` / `admin123`
   - Should see dashboard with students

5. **Test Features**
   - View student list
   - Check alerts
   - Test offline mode (airplane mode)

## 📚 API Documentation

Full API documentation is available at:
- Backend: `http://localhost:3000/api`
- Detailed guide: `backend/TESTING_GUIDE.md`

## 🤝 Support

For issues or questions:
1. Check `backend/TESTING_GUIDE.md`
2. Review console logs for API errors
3. Verify backend is running
4. Check network connectivity
