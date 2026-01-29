# ESP32 Direct Integration Guide

## System Architecture

The system has been updated to support **ESP32 devices sending data directly to the server** via HTTP.

### How It Works

1. **Device Registration** (Admin):
   - Admin registers ESP32 device with a unique `deviceId` (e.g., "ESP32-001")
   - Device gets a MAC address and friendly name
   
2. **Device Assignment** (Admin):
   - Admin assigns the registered device to a student account
   - Each device is linked to exactly ONE student account
   
3. **Data Upload** (ESP32):
   - ESP32 sends vital signs data directly to public endpoint
   - **NO AUTHENTICATION REQUIRED** - device identifies itself by `deviceId`
   - Server automatically associates data with the assigned student

---

## API Endpoints

### 🔐 Admin Endpoints

#### Register Device
```http
POST /api/admin/device/register
Authorization: Bearer {admin_token}

{
  "deviceId": "ESP32-001",          // Required: Unique ID for ESP32
  "deviceName": "Health Monitor #1", // Optional: Friendly name
  "deviceType": "ESP32",             // Optional: Device type
  "macAddress": "AA:BB:CC:DD:EE:FF" // Optional: MAC address
}
```

#### Assign Device to Student
```http
PUT /api/admin/device/{deviceId}/assign
Authorization: Bearer {admin_token}

{
  "studentId": 1  // Student's database ID (integer)
}
```

#### Unassign Device
```http
PUT /api/admin/device/{deviceId}/unassign
Authorization: Bearer {admin_token}
```

#### Get All Devices
```http
GET /api/admin/devices
Authorization: Bearer {admin_token}
```

---

### 🚀 ESP32 Public Endpoint (NO AUTH)

#### Upload Vital Signs
```http
POST /api/vitals/esp32/upload
Content-Type: application/json

{
  "deviceId": "ESP32-001",              // Required
  "heartRate": 75,                      // Optional (bpm)
  "temperature": 36.8,                  // Optional (°C)
  "spO2": 98,                          // Optional (%)
  "bloodPressureSystolic": 120,        // Optional (mmHg)
  "bloodPressureDiastolic": 80,        // Optional (mmHg)
  "batteryLevel": 85                   // Optional (0-100%)
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Vital data uploaded successfully",
  "data": {
    "vital": { /* vital record */ },
    "alerts": [ /* any alerts generated */ ],
    "message": "Data received from device ESP32-001 for student John Doe"
  }
}
```

**Response Errors:**
```json
// Device not registered
{
  "success": false,
  "error": {
    "message": "Device with ID ESP32-001 not registered",
    "code": 404
  }
}

// Device not assigned
{
  "success": false,
  "error": {
    "message": "Device ESP32-001 is not assigned to any student",
    "code": 400
  }
}
```

---

## ESP32 Arduino Example Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:3001/api/vitals/esp32/upload";
const char* deviceId = "ESP32-001";  // Your registered device ID

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Read sensor data
    int heartRate = readHeartRate();
    float temperature = readTemperature();
    int spO2 = readSpO2();
    int batteryLevel = readBattery();
    
    // Create JSON payload
    String jsonData = "{";
    jsonData += "\"deviceId\":\"" + String(deviceId) + "\",";
    jsonData += "\"heartRate\":" + String(heartRate) + ",";
    jsonData += "\"temperature\":" + String(temperature, 1) + ",";
    jsonData += "\"spO2\":" + String(spO2) + ",";
    jsonData += "\"batteryLevel\":" + String(batteryLevel);
    jsonData += "}";
    
    // Send POST request
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error: " + String(httpResponseCode));
    }
    
    http.end();
  }
  
  delay(60000);  // Send data every 60 seconds
}
```

---

## Setup Flow

### 1. Admin Setup
1. Login to admin account at http://localhost:3001/
2. Register ESP32 device with unique ID
3. Assign device to student account

### 2. ESP32 Configuration
1. Flash ESP32 with code
2. Set WiFi credentials
3. Set `deviceId` to match registered device
4. Set `serverUrl` to your backend URL

### 3. Testing
1. Open API tester: http://localhost:3001/
2. Test ESP32 endpoint with device data
3. Check student dashboard for received vitals

---

## Database Schema

### Device Table
```
- id: UUID (primary key)
- deviceId: String (unique) - THIS IS WHAT ESP32 SENDS
- deviceName: String (optional)
- deviceType: String (default: "ESP32")
- macAddress: String (unique, optional)
- status: Enum (ACTIVE, INACTIVE, MAINTENANCE)
- batteryLevel: Integer (0-100)
- lastSyncedAt: DateTime
- studentId: UUID (foreign key - one device per student)
- registeredAt: DateTime
- updatedAt: DateTime
```

---

## Alert System

The system automatically:
- Analyzes vital signs against thresholds
- Creates alerts for abnormal readings
- Updates student health status (STABLE, NEEDS_ATTENTION, CRITICAL)
- Links alerts to the student's profile

---

## Security Notes

⚠️ **Important:**
- ESP32 endpoint is **PUBLIC** (no authentication)
- Device ID is the only identifier
- Make sure deviceId is unique and kept secure
- Consider adding IP whitelisting for production
- Monitor for unauthorized device access

---

## Testing with API Tester

1. Open: http://localhost:3001/
2. Login as admin (username: `admin`, password: `admin123`)
3. Register a test device under "Admin - Devices"
4. Assign it to a student
5. Test ESP32 upload under "Vitals - ESP32 Upload (Public)"
6. Check student vitals to see the data

---

## Troubleshooting

**Device not found:**
- Ensure device is registered with exact deviceId
- Check deviceId spelling matches exactly

**Device not assigned:**
- Use admin panel to assign device to student
- Verify studentId is correct

**Data not appearing:**
- Check server logs for errors
- Verify JSON format is correct
- Ensure at least one vital sign is provided
- Check network connectivity

---

## Next Steps

1. ✅ Database updated for ESP32
2. ✅ Public endpoint created
3. ✅ Device management endpoints ready
4. ✅ API tester updated
5. 🔄 Flash ESP32 with your code
6. 🔄 Test end-to-end flow
