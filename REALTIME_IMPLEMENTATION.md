# Real-Time Vital Signs Implementation

## Overview
The app has been upgraded with WebSocket support to provide real-time updates for vital signs data. This means when vital signs are uploaded to the database, all connected clients (admin and student dashboards) will receive instant updates without needing to refresh.

## What's New

### Backend Changes
1. **WebSocket Server Setup**
   - Added Socket.IO for real-time bidirectional communication
   - Authentication middleware for secure WebSocket connections
   - Room-based architecture (admin room, student-specific rooms)
   - Location: `backend/src/websocket/socket.ts`

2. **Vital Signs Broadcasting**
   - ESP32 uploads now trigger real-time events
   - Manual vital signs uploads trigger real-time events
   - Events are sent to:
     - The specific student's room
     - All connected admins
   - Location: `backend/src/controllers/vital.controller.ts`

### Frontend Changes
1. **WebSocket Service**
   - Client-side WebSocket manager
   - Auto-reconnection logic
   - Event subscription system
   - Location: `viApp/src/services/websocket/websocket.service.ts`

2. **Real-Time Updates in Components**
   - **AdminStudentDetails**: Real-time vital signs for specific student
   - **AdminDashboard**: Real-time updates across all students
   - **StudentDashboard**: Real-time updates for logged-in student
   - All components auto-update when new data arrives

3. **Automatic Connection**
   - WebSocket connects automatically on login
   - Disconnects automatically on logout
   - Location: `viApp/app/index.tsx`

## How It Works

### Flow Diagram
```
ESP32 Device → Backend API → Database
                    ↓
              WebSocket Emit
                    ↓
         ┌──────────┴──────────┐
         ↓                     ↓
    Admin Clients        Student Client
         ↓                     ↓
    Auto-Update UI       Auto-Update UI
```

### Event Types
1. **vitalSigns:update**
   - Triggered when new vital signs are saved
   - Payload includes: studentId, vital signs data, timestamp
   - Received by: admins and the specific student

2. **alert:new**
   - Triggered when abnormal vital signs create alerts
   - Payload includes: studentId, alert data, timestamp
   - Received by: admins and the specific student

## Testing Real-Time Updates

### Scenario 1: ESP32 Upload
1. Log in as admin on one device
2. Log in as student on another device
3. Use ESP32 to upload vital signs OR use the API tester
4. **Expected**: Both admin and student dashboards update instantly

### Scenario 2: Multiple Admin Monitoring
1. Log in as admin on multiple devices/browsers
2. Open different student details on each
3. Upload vital signs for any student
4. **Expected**: All admin dashboards see the update instantly

### Scenario 3: Student Self-Monitoring
1. Log in as a student
2. Have ESP32 device send data
3. **Expected**: Student dashboard updates immediately without refresh

## API Testing

### Using the API Tester (http://localhost:3001/api-tester)
1. Go to "ESP32 Vital Upload" section
2. Enter device ID (e.g., "ESP32_001")
3. Enter vital signs values
4. Click "Upload"
5. Check the frontend - should update instantly

### Using cURL
```bash
curl -X POST http://192.168.100.10:3001/api/vitals/esp32/upload \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32_001",
    "heartRate": 75,
    "temperature": 36.5,
    "spO2": 98,
    "bloodPressureSystolic": 120,
    "bloodPressureDiastolic": 80,
    "batteryLevel": 85
  }'
```

## Performance Improvements

### Before (Polling)
- Frontend polls every 5-30 seconds
- Unnecessary network requests
- Delayed updates (up to 30s lag)
- Higher battery consumption

### After (WebSocket)
- Instant updates (<1 second)
- No unnecessary polling
- Reduced network traffic
- Lower battery consumption
- Real-time synchronization

## Connection Status Monitoring

The WebSocket service logs connection status to the console:
- 🔌 Connecting to WebSocket
- ✅ WebSocket connected
- 📊 Received vital signs update
- 🚨 Received new alert
- ❌ WebSocket disconnected
- ⚠️ WebSocket connection error

## Additional Optimizations

### Caching Strategy
The app now maintains local state and only updates when real-time events arrive, reducing redundant API calls.

### Subscription Management
Components automatically subscribe on mount and unsubscribe on unmount to prevent memory leaks.

### Room-Based Broadcasting
- Students only receive their own data
- Admins receive all student updates
- Efficient, targeted data delivery

## Troubleshooting

### WebSocket Not Connecting
1. Check if backend is running: `ws://192.168.100.10:3001`
2. Verify token is saved in AsyncStorage
3. Check console for connection errors

### No Real-Time Updates
1. Verify WebSocket connection status (check console logs)
2. Ensure device/student IDs match
3. Check network connectivity
4. Restart the app

### Multiple Connections
- Each login creates a new WebSocket connection
- Old connections are automatically cleaned up
- Logout disconnects immediately

## Future Enhancements
- Connection status indicator in UI
- Offline queue for vital signs
- Compression for large data transfers
- WebSocket reconnection with exponential backoff
- Real-time presence indicators (who's online)
- Live chat between admin and students
- Real-time notifications with sound/vibration

## Production Considerations
- Update WebSocket URL in `environment.ts` for production
- Enable WSS (WebSocket Secure) with SSL/TLS
- Configure CORS properly for production domain
- Monitor WebSocket connections for performance
- Implement rate limiting for WebSocket events

## Summary
Your app is now fully optimized with real-time capabilities! Vital signs update instantly across all connected devices, providing a true real-time health monitoring experience.
