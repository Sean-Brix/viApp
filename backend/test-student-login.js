// Test student login
const axios = require('axios');

async function test() {
  try {
    console.log('Testing student login...');
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'maria.santos',
      password: 'student123'
    });
    console.log('✅ Success!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Failed');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

test();
