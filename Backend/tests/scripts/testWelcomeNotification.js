// Test script to register a new job seeker and check if they receive welcome notification
const { default: fetch } = require('node-fetch');

async function testJobSeekerNotification() {
  try {
    console.log('🧪 Testing Job Seeker Welcome Notification...\n');
    
    // Register a new job seeker
    console.log('1. Registering new job seeker...');
    const registrationData = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@test.com`,
      phone: '1234567890',
      city: 'Toronto',
      province: 'Ontario',
      isNewcomer: true,
      password: 'testpassword123'
    };
    
    const registerResponse = await fetch('http://localhost:5000/api/v1/auth/register/job-seeker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });
    
    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      throw new Error(`Registration failed: ${registerResponse.status} - ${error}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('✅ Registration successful!');
    console.log(`User ID: ${registerData.data.user.id}`);
    console.log(`Email: ${registerData.data.user.email}`);
    
    const token = registerData.data.token;
    const userId = registerData.data.user.id;
    
    // Wait a moment for notifications to be created
    console.log('\n2. Waiting for notifications to be created...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if the user received welcome notification
    console.log('3. Checking for welcome notification...');
    const notifResponse = await fetch('http://localhost:5000/api/v1/notifications?limit=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!notifResponse.ok) {
      throw new Error(`Failed to fetch notifications: ${notifResponse.status}`);
    }
    
    const notifData = await notifResponse.json();
    console.log(`✅ API Response: ${notifData.message}`);
    console.log(`📧 Notifications received: ${notifData.data.notifications.length}`);
    
    if (notifData.data.notifications.length > 0) {
      console.log('\n📋 Notification Details:');
      notifData.data.notifications.forEach((notif, index) => {
        console.log(`${index + 1}. Title: ${notif.title}`);
        console.log(`   Type: ${notif.type}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Read: ${notif.isRead ? 'Yes' : 'No'}`);
        console.log(`   Created: ${new Date(notif.createdAt).toLocaleString()}`);
        console.log('---');
      });
      
      const welcomeNotif = notifData.data.notifications.find(n => n.type === 'welcome');
      if (welcomeNotif) {
        console.log('🎉 SUCCESS: Welcome notification found!');
      } else {
        console.log('⚠️  No welcome notification found, but other notifications exist');
      }
    } else {
      console.log('❌ No notifications found for the new user');
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

// Run the test
testJobSeekerNotification();