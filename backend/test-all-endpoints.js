// Comprehensive API Endpoint Testing Script
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
const HEALTH_URL = 'http://localhost:3001/health';

let adminToken = '';
let studentToken = '';
let adminRefreshToken = '';
let testStudentId = '';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) console.log(`   ${details}`);
}

async function runTests() {
  log('\n╔═══════════════════════════════════════════════╗', 'cyan');
  log('║   ViApp Backend API - Endpoint Testing       ║', 'cyan');
  log('╚═══════════════════════════════════════════════╝\n', 'cyan');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // ====================
  // 1. HEALTH CHECK
  // ====================
  log('\n📋 1. HEALTH CHECK ENDPOINT', 'blue');
  log('─────────────────────────────────────────────', 'blue');
  
  try {
    totalTests++;
    const response = await axios.get(HEALTH_URL);
    const passed = response.status === 200 && response.data.status === 'OK';
    passed ? passedTests++ : failedTests++;
    logTest('GET /health', passed, `Status: ${response.data.status}`);
  } catch (error) {
    failedTests++;
    logTest('GET /health', false, error.message);
    log('⚠️  Server is not running. Please start the backend server first.', 'red');
    return;
  }

  // ====================
  // 2. AUTHENTICATION
  // ====================
  log('\n🔐 2. AUTHENTICATION ENDPOINTS', 'blue');
  log('─────────────────────────────────────────────', 'blue');

  // Test Login - Admin
  try {
    totalTests++;
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = response.data.data.accessToken;
    adminRefreshToken = response.data.data.refreshToken;
    const passed = response.status === 200 && adminToken;
    passed ? passedTests++ : failedTests++;
    logTest('POST /auth/login (Admin)', passed, `Token: ${adminToken.substring(0, 20)}...`);
  } catch (error) {
    failedTests++;
    logTest('POST /auth/login (Admin)', false, error.response?.data?.message || error.message);
  }

  // Test Login - Student
  try {
    totalTests++;
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'maria.santos',
      password: 'student123'
    });
    studentToken = response.data.data.accessToken;
    testStudentId = response.data.data.user.studentId;
    const passed = response.status === 200 && studentToken;
    passed ? passedTests++ : failedTests++;
    logTest('POST /auth/login (Student)', passed, `Student ID: ${testStudentId}`);
  } catch (error) {
    failedTests++;
    logTest('POST /auth/login (Student)', false, error.response?.data?.message || error.message);
  }

  // Test Refresh Token
  try {
    totalTests++;
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: adminRefreshToken
    });
    const passed = response.status === 200 && response.data.data.accessToken;
    passed ? passedTests++ : failedTests++;
    logTest('POST /auth/refresh', passed);
  } catch (error) {
    failedTests++;
    logTest('POST /auth/refresh', false, error.response?.data?.message || error.message);
  }

  // Test Invalid Login
  try {
    totalTests++;
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'invalid',
      password: 'wrong'
    });
    failedTests++;
    logTest('POST /auth/login (Invalid)', false, 'Should have failed but succeeded');
  } catch (error) {
    const passed = error.response?.status === 401;
    passed ? passedTests++ : failedTests++;
    logTest('POST /auth/login (Invalid)', passed, 'Correctly rejected invalid credentials');
  }

  // ====================
  // 3. STUDENT ENDPOINTS
  // ====================
  log('\n👨‍🎓 3. STUDENT ENDPOINTS', 'blue');
  log('─────────────────────────────────────────────', 'blue');

  // Get Student Profile
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/student/profile`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passed = response.status === 200 && response.data.data;
    passed ? passedTests++ : failedTests++;
    logTest('GET /student/profile', passed, `Name: ${response.data.data.firstName} ${response.data.data.lastName}`);
  } catch (error) {
    failedTests++;
    logTest('GET /student/profile', false, error.response?.data?.message || error.message);
  }

  // Update Student Profile
  try {
    totalTests++;
    const response = await axios.put(`${API_URL}/student/profile`, {
      contactNumber: '+63 912 345 6789'
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passed = response.status === 200;
    passed ? passedTests++ : failedTests++;
    logTest('PUT /student/profile', passed);
  } catch (error) {
    failedTests++;
    logTest('PUT /student/profile', false, error.response?.data?.message || error.message);
  }

  // Get Latest Vitals
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/student/vitals/latest`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passed = response.status === 200;
    passed ? passedTests++ : failedTests++;
    logTest('GET /student/vitals/latest', passed, response.data.data ? 'Has vitals data' : 'No vitals yet');
  } catch (error) {
    failedTests++;
    logTest('GET /student/vitals/latest', false, error.response?.data?.message || error.message);
  }

  // Get Vitals History
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/student/vitals/history?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passed = response.status === 200 && Array.isArray(response.data.data);
    passed ? passedTests++ : failedTests++;
    const count = Array.isArray(response.data.data) ? response.data.data.length : 0;
    logTest('GET /student/vitals/history', passed, `Found ${count} records`);
  } catch (error) {
    failedTests++;
    logTest('GET /student/vitals/history', false, error.response?.data?.message || error.message);
  }

  // Get Student Alerts
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/student/alerts?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passed = response.status === 200 && Array.isArray(response.data.data);
    passed ? passedTests++ : failedTests++;
    const count = Array.isArray(response.data.data) ? response.data.data.length : 0;
    logTest('GET /student/alerts', passed, `Found ${count} alerts`);
  } catch (error) {
    failedTests++;
    logTest('GET /student/alerts', false, error.response?.data?.message || error.message);
  }

  // Update Notification Settings
  try {
    totalTests++;
    const response = await axios.put(`${API_URL}/student/notifications`, {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passed = response.status === 200;
    passed ? passedTests++ : failedTests++;
    logTest('PUT /student/notifications', passed);
  } catch (error) {
    failedTests++;
    logTest('PUT /student/notifications', false, error.response?.data?.message || error.message);
  }

  // ====================
  // 4. ADMIN ENDPOINTS
  // ====================
  log('\n👨‍💼 4. ADMIN ENDPOINTS', 'blue');
  log('─────────────────────────────────────────────', 'blue');

  // Get All Students
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/admin/students?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const passed = response.status === 200 && response.data.data.students && Array.isArray(response.data.data.students);
    passed ? passedTests++ : failedTests++;
    const count = response.data.data.students ? response.data.data.students.length : 0;
    logTest('GET /admin/students', passed, `Found ${count} students`);
  } catch (error) {
    failedTests++;
    logTest('GET /admin/students', false, error.response?.data?.message || error.message);
  }

  // Get Student by ID
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/admin/student/${testStudentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const passed = response.status === 200 && response.data.data;
    passed ? passedTests++ : failedTests++;
    logTest('GET /admin/student/:id', passed);
  } catch (error) {
    failedTests++;
    logTest('GET /admin/student/:id', false, error.response?.data?.message || error.message);
  }

  // Update Student
  try {
    totalTests++;
    const response = await axios.put(`${API_URL}/admin/student/${testStudentId}`, {
      email: 'maria.santos.updated@sfmnhs.edu'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const passed = response.status === 200;
    passed ? passedTests++ : failedTests++;
    logTest('PUT /admin/student/:id', passed);
  } catch (error) {
    failedTests++;
    logTest('PUT /admin/student/:id', false, error.response?.data?.message || error.message);
  }

  // Get All Alerts (Admin)
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/admin/alerts?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const passed = response.status === 200 && response.data.data.alerts && Array.isArray(response.data.data.alerts);
    passed ? passedTests++ : failedTests++;
    const count = response.data.data.alerts ? response.data.data.alerts.length : 0;
    logTest('GET /admin/alerts', passed, `Found ${count} alerts`);
  } catch (error) {
    failedTests++;
    logTest('GET /admin/alerts', false, error.response?.data?.message || error.message);
  }

  // Get All Devices
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/admin/devices`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const passed = response.status === 200 && Array.isArray(response.data.data);
    passed ? passedTests++ : failedTests++;
    logTest('GET /admin/devices', passed, `Found ${response.data.data.length} devices`);
  } catch (error) {
    failedTests++;
    logTest('GET /admin/devices', false, error.response?.data?.message || error.message);
  }

  // Register Device
  try {
    totalTests++;
    const testDeviceId = `VB-TEST-${Date.now()}`;
    const response = await axios.post(`${API_URL}/admin/device/register`, {
      deviceId: testDeviceId,
      serialNumber: `SN-${Date.now()}`,
      model: 'ViBand Pro',
      manufacturer: 'ViBand Inc'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const passed = response.status === 201;
    passed ? passedTests++ : failedTests++;
    logTest('POST /admin/device/register', passed, `Device ID: ${testDeviceId}`);
  } catch (error) {
    failedTests++;
    logTest('POST /admin/device/register', false, error.response?.data?.message || error.message);
  }

  // ====================
  // 5. VITALS ENDPOINTS
  // ====================
  log('\n💓 5. VITALS ENDPOINTS', 'blue');
  log('─────────────────────────────────────────────', 'blue');

  // Upload Single Vital (Student token)
  try {
    totalTests++;
    const response = await axios.post(`${API_URL}/vitals/upload`, {
      heartRate: 75,
      temperature: 36.8,
      spo2: 98,
      respiratoryRate: 16,
      bloodPressureSystolic: 115,
      bloodPressureDiastolic: 75,
      deviceId: 'VB-001-2024'
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passed = response.status === 201;
    passed ? passedTests++ : failedTests++;
    logTest('POST /vitals/upload', passed, `Status: ${response.data.data?.status || 'N/A'}`);
  } catch (error) {
    failedTests++;
    logTest('POST /vitals/upload', false, error.response?.data?.message || error.message);
  }

  // Bulk Upload Vitals (Student token)
  try {
    totalTests++;
    const response = await axios.post(`${API_URL}/vitals/bulk-upload`, {
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
    const passed = response.status === 200;
    passed ? passedTests++ : failedTests++;
    const uploaded = response.data.data?.success || 0;
    logTest('POST /vitals/bulk-upload', passed, `Uploaded ${uploaded} vitals`);
  } catch (error) {
    failedTests++;
    logTest('POST /vitals/bulk-upload', false, error.response?.data?.message || error.message);
  }

  // ====================
  // 6. AUTHORIZATION TESTS
  // ====================
  log('\n🔒 6. AUTHORIZATION TESTS', 'blue');
  log('─────────────────────────────────────────────', 'blue');

  // Test Student accessing Admin endpoint (should fail)
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/admin/students`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    failedTests++;
    logTest('Student accessing Admin endpoint', false, 'Should have been blocked');
  } catch (error) {
    const passed = error.response?.status === 403;
    passed ? passedTests++ : failedTests++;
    logTest('Student accessing Admin endpoint', passed, 'Correctly blocked unauthorized access');
  }

  // Test without token (should fail)
  try {
    totalTests++;
    const response = await axios.get(`${API_URL}/student/profile`);
    failedTests++;
    logTest('Access without token', false, 'Should have been blocked');
  } catch (error) {
    const passed = error.response?.status === 401;
    passed ? passedTests++ : failedTests++;
    logTest('Access without token', passed, 'Correctly requires authentication');
  }

  // ====================
  // 7. LOGOUT
  // ====================
  log('\n🚪 7. LOGOUT ENDPOINT', 'blue');
  log('─────────────────────────────────────────────', 'blue');

  try {
    totalTests++;
    const response = await axios.post(`${API_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const passed = response.status === 200;
    passed ? passedTests++ : failedTests++;
    logTest('POST /auth/logout', passed);
  } catch (error) {
    failedTests++;
    logTest('POST /auth/logout', false, error.response?.data?.message || error.message);
  }

  // ====================
  // SUMMARY
  // ====================
  log('\n╔═══════════════════════════════════════════════╗', 'cyan');
  log('║              TEST SUMMARY                     ║', 'cyan');
  log('╚═══════════════════════════════════════════════╝', 'cyan');
  
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`\nTotal Tests:  ${totalTests}`);
  log(`Passed:       ${passedTests}`, 'green');
  log(`Failed:       ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`Pass Rate:    ${passRate}%`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');
  
  if (passRate >= 90) {
    log('\n🎉 EXCELLENT! All major endpoints are working correctly!', 'green');
  } else if (passRate >= 70) {
    log('\n⚠️  GOOD, but some endpoints need attention.', 'yellow');
  } else {
    log('\n❌ ISSUES DETECTED. Please review failed tests.', 'red');
  }
  
  log('\n');
}

// Run the tests
runTests().catch(error => {
  log('\n❌ Test suite failed:', 'red');
  console.error(error);
  process.exit(1);
});
