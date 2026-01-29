// Test bulk upload response
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function test() {
  try {
    // Login as student
    const login = await axios.post(`${API_URL}/auth/login`, {
      username: 'maria.santos',
      password: 'student123'
    });
    const studentToken = login.data.data.accessToken;

    // Bulk upload
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

    console.log('Status:', response.status);
    console.log('Expected: 201');
    console.log('Passed:', response.status === 201);
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data);
  }
}

test();
