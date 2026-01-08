// Test company welcome notification
const { default: fetch } = require('node-fetch');

async function testCompanyNotification() {
  try {
    console.log('🧪 Testing Company Welcome Notification...\n');
    
    const registrationData = {
      companyName: `Test Company ${Date.now()}`,
      companyEmail: `company${Date.now()}@test.com`,
      contactName: 'John Smith',
      contactPhone: '1234567890',
      city: 'Vancouver',
      province: 'British Columbia',
      website: 'https://testcompany.com',
      password: 'companypassword123'
    };
    
    console.log('1. Registering new company...');
    const registerResponse = await fetch('http://localhost:5000/api/v1/auth/register/company', {
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
    console.log('✅ Company registration successful!');
    console.log(`User ID: ${registerData.data.user.id}`);
    console.log(`Company Email: ${registerData.data.user.email}`);
    
    const token = registerData.data.token;
    
    console.log('\n2. Waiting for notifications...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('3. Checking for welcome notification...');
    const notifResponse = await fetch('http://localhost:5000/api/v1/notifications?limit=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const notifData = await notifResponse.json();
    console.log(`✅ Notifications received: ${notifData.data.notifications.length}`);
    
    if (notifData.data.notifications.length > 0) {
      console.log('\n📋 Company Notification Details:');
      notifData.data.notifications.forEach((notif, index) => {
        console.log(`${index + 1}. Title: ${notif.title}`);
        console.log(`   Type: ${notif.type}`);
        console.log(`   Message: ${notif.message.substring(0, 100)}...`);
        console.log(`   Read: ${notif.isRead ? 'Yes' : 'No'}`);
        console.log('---');
      });
      
      const welcomeNotif = notifData.data.notifications.find(n => n.type === 'welcome');
      if (welcomeNotif) {
        console.log('🎉 SUCCESS: Company welcome notification found!');
      }
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testCompanyNotification();