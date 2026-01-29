// Detailed test for failing endpoints
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testDetailedEndpoints() {
  console.log('\n🔍 Testing failing endpoints in detail...\n');

  try {
    // Login as student
    console.log('1. Logging in as student...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'maria.santos',
      password: 'student123'
    });
    const studentToken = loginResponse.data.data.accessToken;
    const studentId = loginResponse.data.data.user.studentId;
    console.log(`✅ Login successful, Student ID: ${studentId}\n`);

    // Login as admin
    console.log('2. Logging in as admin...');
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.data.accessToken;
    const adminRefreshToken = adminLogin.data.data.refreshToken;
    console.log(`✅ Admin login successful\n`);

    // Test refresh token
    console.log('3. Testing refresh token...');
    try {
      const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: adminRefreshToken
      });
      console.log(`✅ Refresh token works: ${JSON.stringify(refreshResponse.data, null, 2)}\n`);
    } catch (error) {
      console.log(`❌ Refresh token failed:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    }

    // Test vitals history
    console.log('4. Testing vitals history...');
    try {
      const vitalsHistory = await axios.get(`${API_URL}/student/vitals/history?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log(`✅ Vitals history response: ${JSON.stringify(vitalsHistory.data, null, 2)}\n`);
    } catch (error) {
      console.log(`❌ Vitals history failed:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    }

    // Test student alerts
    console.log('5. Testing student alerts...');
    try {
      const alerts = await axios.get(`${API_URL}/student/alerts?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log(`✅ Alerts response: ${JSON.stringify(alerts.data, null, 2)}\n`);
    } catch (error) {
      console.log(`❌ Alerts failed:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    }

    // Test notification settings update
    console.log('6. Testing notification settings update...');
    try {
      const notifResponse = await axios.put(`${API_URL}/student/notifications`, {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false
      }, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log(`✅ Notification update response: ${JSON.stringify(notifResponse.data, null, 2)}\n`);
    } catch (error) {
      console.log(`❌ Notification update failed:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    }

    // Test update student (admin)
    console.log('7. Testing admin student update...');
    try {
      const updateResponse = await axios.put(`${API_URL}/admin/student/${studentId}`, {
        email: 'maria.santos.test@sfmnhs.edu'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Student update response: ${JSON.stringify(updateResponse.data, null, 2)}\n`);
    } catch (error) {
      console.log(`❌ Student update failed:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    }

    // Test bulk upload vitals
    console.log('8. Testing bulk upload vitals...');
    try {
      const bulkResponse = await axios.post(`${API_URL}/vitals/bulk-upload`, {
        vitals: [
          {
            heartRate: 72,
            temperature: 36.7,
            spo2: 97,
            respiratoryRate: 15,
            bloodPressureSystolic: 112,
            bloodPressureDiastolic: 72,
            deviceId: 'VB-001-2024',
            timestamp: new Date().toISOString()
          }
        ]
      }, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log(`✅ Bulk upload response: ${JSON.stringify(bulkResponse.data, null, 2)}\n`);
    } catch (error) {
      console.log(`❌ Bulk upload failed:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    }

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testDetailedEndpoints();
