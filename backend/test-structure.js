// Quick test to check admin/students response structure
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

    // Get students
    const response = await axios.get(`${API_URL}/admin/students?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('Response structure:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\nData type:', typeof response.data.data);
    console.log('Is array:', Array.isArray(response.data.data));
    if (Array.isArray(response.data.data)) {
      console.log('Length:', response.data.data.length);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
