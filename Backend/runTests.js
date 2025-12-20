#!/usr/bin/env node
const { spawn } = require('child_process');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

// Start server
console.log('🚀 Starting backend server...\n');
const server = spawn('node', ['server.js'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

let serverReady = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('MongoDB Connected')) {
    serverReady = true;
    setTimeout(() => runTests(), 1000);
  }
  // Uncomment to see server logs
  // process.stdout.write(output);
});

server.stderr.on('data', (data) => {
  const output = data.toString();
  // process.stderr.write(output);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

async function runTests() {
  try {
    console.log('\n=== Testing Notification System ===\n');
    
    // 1. Register Job Seeker
    console.log('1️⃣  Creating Job Seeker Account...');
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

    const jobSeekerRes = await axios.post(`${API_URL}/auth/register/job-seeker`, jobSeekerData);
    const jobSeekerEmail = jobSeekerRes.data.data.user.email;
    console.log('✅ Job Seeker Registered:', jobSeekerEmail);

    // 2. Login as Admin
    console.log('\n2️⃣  Getting Admin Token...');
    const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'spyboy000008@gmail.com',
      password: 'admin123'
    });
    const adminToken = adminLoginRes.data.data.token;
    console.log('✅ Admin Logged In');

    // 3. Get Notifications
    console.log('\n3️⃣  Fetching Admin Notifications...');
    console.log('   URL:', `${API_URL}/notifications`);
    const notificationsRes = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    console.log('   Response:', JSON.stringify(notificationsRes.data, null, 2).substring(0, 500));
    const notifications = notificationsRes.data.data?.notifications || notificationsRes.data.data || [];
    console.log(`✅ Found ${notifications.length} total notifications\n`);
    
    // Check for job seeker notification
    const jobSeekerNotif = notifications.find(n => 
      n.message && n.message.includes('Jane Doe') && n.type === 'admin_notification'
    );
    
    if (jobSeekerNotif) {
      console.log('✅✅✅ SUCCESS! Job Seeker Registration Notification Found! ✅✅✅');
      console.log('   📌 Title:', jobSeekerNotif.title);
      console.log('   📝 Message:', jobSeekerNotif.message);
      console.log('   📊 Type:', jobSeekerNotif.type);
      console.log('   🔖 Status:', jobSeekerNotif.isRead ? 'READ' : 'UNREAD');
      console.log('   🎯 Data:', JSON.stringify(jobSeekerNotif.metadata, null, 2));
    } else {
      console.log('❌ Job Seeker Notification NOT Found');
      console.log('   Recent notifications:');
      notifications.slice(0, 5).forEach((n, i) => {
        console.log(`   ${i+1}. ${n.title} - ${n.message.substring(0, 50)}...`);
      });
    }

    // 4. Register Company
    console.log('\n4️⃣  Creating Company Account...');
    const companyData = {
      companyName: `Tech Solutions Inc ${Date.now()}`,
      companyEmail: `tech.solutions.${Date.now()}@example.com`,
      contactName: 'Bob Smith',
      contactPhone: '4165559999',
      city: 'Vancouver',
      province: 'British Columbia',
      website: 'https://techsolutions.com',
      password: 'Password123!'
    };

    const companyRes = await axios.post(`${API_URL}/auth/register/company`, companyData);
    const companyEmail = companyRes.data.data.user.email;
    console.log('✅ Company Registered:', companyEmail);

    // 5. Get Updated Notifications
    console.log('\n5️⃣  Fetching Updated Admin Notifications...');
    const updatedRes = await axios.get(`${API_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    const updatedNotifications = updatedRes.data.data?.notifications || updatedRes.data.data || [];
    console.log(`✅ Found ${updatedNotifications.length} total notifications\n`);
    
    // Check for company notification
    const companyNotif = updatedNotifications.find(n => 
      n.message && n.message.includes('Tech Solutions Inc') && n.type === 'admin_notification'
    );
    
    if (companyNotif) {
      console.log('✅✅✅ SUCCESS! Company Registration Notification Found! ✅✅✅');
      console.log('   📌 Title:', companyNotif.title);
      console.log('   📝 Message:', companyNotif.message);
      console.log('   📊 Type:', companyNotif.type);
      console.log('   🔖 Status:', companyNotif.isRead ? 'READ' : 'UNREAD');
      console.log('   🎯 Data:', JSON.stringify(companyNotif.metadata, null, 2));
    } else {
      console.log('❌ Company Notification NOT Found');
      console.log('   Recent notifications:');
      updatedNotifications.slice(0, 5).forEach((n, i) => {
        console.log(`   ${i+1}. ${n.title} - ${n.message.substring(0, 50)}...`);
      });
    }

    console.log('\n=== 🎉 Test Complete ===\n');
    
    // Exit gracefully
    server.kill();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    server.kill();
    process.exit(1);
  }
}

// Set a timeout in case server doesn't start
setTimeout(() => {
  if (!serverReady) {
    console.error('Server failed to start within 30 seconds');
    server.kill();
    process.exit(1);
  }
}, 30000);
