const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api/v1';

async function testNotifications() {
  try {
    console.log('\n=== Testing Notification System ===\n');
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('1. Creating Job Seeker Account...');
    const jobSeekerData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: `jane.doe.${Date.now()}@example.com`,
      phone: '4165551234',
      city: 'Toronto',
      province: 'Ontario',
      isNewcomer: true,
      password: 'Password123!'
    };

    try {
      const jobSeekerRes = await axios.post(`${API_URL}/auth/register/job-seeker`, jobSeekerData);
      console.log('✅ Job Seeker Registered:', jobSeekerRes.data.data.user.email);
      console.log('   Token:', jobSeekerRes.data.data.token.substring(0, 20) + '...');
    } catch (err) {
      console.log('Error details:', err.message);
      console.log('Status:', err.response?.status);
      console.log('Data:', err.response?.data);
      throw err;
    }

    // Get admin token
    console.log('\n2. Getting Admin Token...');
    const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'spyboy000008@gmail.com',
      password: 'admin123'
    });
    const adminToken = adminLoginRes.data.data.token;
    console.log('✅ Admin Logged In');

    // Get notifications for admin
    console.log('\n3. Fetching Admin Notifications...');
    const notificationsRes = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    const notifications = notificationsRes.data.data;
    console.log(`✅ Found ${notifications.length} notifications`);
    
    // Check if our new job seeker registration triggered a notification
    const jobSeekerNotif = notifications.find(n => 
      n.message.includes('Jane Doe') && n.type === 'admin_notification'
    );
    
    if (jobSeekerNotif) {
      console.log('\n✅ SUCCESS! Job Seeker Registration Notification Found:');
      console.log('   Title:', jobSeekerNotif.title);
      console.log('   Message:', jobSeekerNotif.message);
      console.log('   Metadata:', jobSeekerNotif.metadata);
      console.log('   Status:', jobSeekerNotif.isRead ? 'READ' : 'UNREAD');
    } else {
      console.log('\n❌ Job Seeker Registration Notification NOT Found');
      console.log('   Recent notifications:');
      notifications.slice(0, 3).forEach(n => {
        console.log(`   - ${n.title}: ${n.message}`);
      });
    }

    // Test company registration
    console.log('\n4. Creating Company Account...');
    const companyData = {
      companyName: 'Tech Solutions Inc',
      companyEmail: `tech.solutions.${Date.now()}@example.com`,
      contactName: 'Bob Smith',
      contactPhone: '4165559999',
      city: 'Vancouver',
      province: 'British Columbia',
      website: 'https://techsolutions.com',
      password: 'Password123!'
    };

    const companyRes = await axios.post(`${API_URL}/auth/register/company`, companyData);
    console.log('✅ Company Registered:', companyRes.data.data.user.email);

    // Get updated notifications
    console.log('\n5. Fetching Updated Admin Notifications...');
    const updatedRes = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    const updatedNotifications = updatedRes.data.data;
    console.log(`✅ Found ${updatedNotifications.length} total notifications`);
    
    // Check if company registration triggered a notification
    const companyNotif = updatedNotifications.find(n => 
      n.message.includes('Tech Solutions Inc') && n.type === 'admin_notification'
    );
    
    if (companyNotif) {
      console.log('\n✅ SUCCESS! Company Registration Notification Found:');
      console.log('   Title:', companyNotif.title);
      console.log('   Message:', companyNotif.message);
      console.log('   Metadata:', companyNotif.metadata);
    } else {
      console.log('\n❌ Company Registration Notification NOT Found');
    }

    console.log('\n=== Test Complete ===\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Full response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testNotifications();
