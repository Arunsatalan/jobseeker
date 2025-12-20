// Test the notification API directly
const { default: fetch } = require('node-fetch');

async function testNotificationAPI() {
  try {
    // First, get admin token by logging in
    console.log('🔑 Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'spyboy000008@gmail.com',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('Admin User:', loginData.data.user);
    
    const token = loginData.data.token;
    
    // Now test notifications API
    console.log('\n📧 Testing notifications API...');
    const notifResponse = await fetch('http://localhost:5000/api/v1/notifications?limit=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response Status:', notifResponse.status);
    
    if (!notifResponse.ok) {
      const errorText = await notifResponse.text();
      console.error('❌ API Error:', errorText);
      return;
    }
    
    const notifData = await notifResponse.json();
    console.log('✅ API Response:', JSON.stringify(notifData, null, 2));
    
    // Count notifications
    const count = notifData.data?.notifications?.length || 0;
    console.log(`\n📊 Result: ${count} notifications received`);
    
    if (count > 0) {
      console.log('\n📝 Notification titles:');
      notifData.data.notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} (${notif.isRead ? 'Read' : 'Unread'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testNotificationAPI();