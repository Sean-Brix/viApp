// Quick test to check admin/alerts response structure
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function test() {
  try {
    // Login as admin
    const login = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const adminToken = login.data.data.accessToken;

    // Get alerts
    const response = await axios.get(`${API_URL}/admin/alerts?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('Alerts Response structure:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
