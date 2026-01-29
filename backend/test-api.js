// Test backend API connection
const axios = require('axios');

const API_URL = 'http://192.168.100.10:3001/api';

async function testAPI() {
  console.log('🧪 Testing ViApp Backend API...\n');
  
  // Test 1: Health check
  try {
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get('http://192.168.100.10:3001/health');
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Server is not running or not accessible');
    }
    process.exit(1);
  }
  
  // Test 2: Login with test credentials
  try {
    console.log('\n2️⃣ Testing login endpoint...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Login successful');
    console.log('   User:', loginResponse.data.data.user.username);
    console.log('   Role:', loginResponse.data.data.user.role);
    console.log('   Token:', loginResponse.data.data.accessToken.substring(0, 20) + '...');
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
  
  console.log('\n✅ API tests complete!');
}

testAPI();
