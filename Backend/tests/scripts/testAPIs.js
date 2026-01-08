const axios = require('axios');

async function testAPIs() {
  try {
    // Test admin users endpoint
    console.log('Testing admin users endpoint...');
    const usersResponse = await axios.get('http://localhost:5000/api/v1/admin/users', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // You'll need to replace this
        'Content-Type': 'application/json'
      }
    });
    console.log('Users response:', usersResponse.data);

    // Test companies endpoint
    console.log('\nTesting companies endpoint...');
    const companiesResponse = await axios.get('http://localhost:5000/api/v1/companies', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // You'll need to replace this
        'Content-Type': 'application/json'
      }
    });
    console.log('Companies response:', companiesResponse.data);

    // Test jobs endpoint
    console.log('\nTesting jobs endpoint...');
    const jobsResponse = await axios.get('http://localhost:5000/api/v1/jobs', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // You'll need to replace this
        'Content-Type': 'application/json'
      }
    });
    console.log('Jobs response:', jobsResponse.data);

  } catch (error) {
    console.error('API test error:', error.response?.data || error.message);
  }
}

testAPIs();