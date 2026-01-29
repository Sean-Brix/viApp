// Test refresh token
const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function test() {
  try {
    console.log('1. Login as admin...');
    const login = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    const accessToken = login.data.data.accessToken;
    const refreshToken = login.data.data.refreshToken;
    
    console.log('✅ Login successful');
    console.log('Access Token:', accessToken.substring(0, 30) + '...');
    console.log('Refresh Token:', refreshToken.substring(0, 30) + '...');

    console.log('\n2. Using refresh token...');
    console.log('Sending refreshToken:', refreshToken);
    const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });

    console.log('✅ Refresh successful');
    console.log('New Access Token:', refreshResponse.data.data.accessToken.substring(0, 30) + '...');
    console.log('\nResponse:', JSON.stringify(refreshResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error message:', error.message);
    
    // Check if JWT can decode the refresh token
    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.decode(refreshToken);
      console.log('\nDecoded refresh token:', decoded);
    } catch (e) {
      console.error('Could not decode token:', e.message);
    }
  }
}

test();
