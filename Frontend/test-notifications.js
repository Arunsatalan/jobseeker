/**
 * Test script to verify admin notifications are working
 * Run this in browser console while logged in as admin
 */

async function testAdminNotifications() {
  console.log('🔍 Testing Admin Notifications...\n');
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('📋 Auth Info:');
  console.log('Token exists:', !!token);
  console.log('User stored:', !!user);
  
  if (!token) {
    console.error('❌ No token found! Admin must be logged in.');
    return;
  }
  
  try {
    console.log('\n📡 Fetching notifications from: http://localhost:5000/api/v1/notifications');
    
    const response = await fetch('http://localhost:5000/api/v1/notifications?limit=20', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    
    if (data.success && data.data?.notifications) {
      console.log(`\n📬 Found ${data.data.notifications.length} notifications:`);
      console.table(data.data.notifications.map(n => ({
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead ? '✓ Read' : '⚠ Unread',
        createdAt: new Date(n.createdAt).toLocaleString(),
      })));
      
      const unreadCount = data.data.notifications.filter(n => !n.isRead).length;
      console.log(`\n🔔 Unread Notifications: ${unreadCount}`);
    } else {
      console.warn('⚠️ Unexpected response format');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testAdminNotifications();
