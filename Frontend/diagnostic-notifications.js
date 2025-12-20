/**
 * DIAGNOSTIC SCRIPT - Run in Browser Console to Debug Notifications
 * 
 * Copy and paste the entire script below into browser console while logged in as admin
 */

async function diagnoseNotifications() {
  console.clear();
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║              NOTIFICATION SYSTEM DIAGNOSTIC TOOL                 ║
╚═══════════════════════════════════════════════════════════════════╝
  `);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    console.error('❌ No token found - Admin not logged in!');
    return;
  }

  console.log('✅ Token found:', token.substring(0, 30) + '...\n');

  // Step 1: Get current admin info
  console.log('📋 STEP 1: Checking Your Admin Account...');
  try {
    const meRes = await fetch('http://localhost:5000/api/v1/debug/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    
    if (meData.success) {
      console.log('✅ You are logged in as:');
      console.table(meData.user);
      console.log('Admin ID:', meData.user._id);
    } else {
      console.error('❌ Could not get admin info:', meData.message);
    }
  } catch (e) {
    console.error('❌ Error fetching admin info:', e.message);
  }

  console.log('\n');

  // Step 2: Get all admin users
  console.log('📋 STEP 2: Listing All Admin Users in Database...');
  try {
    const adminsRes = await fetch('http://localhost:5000/api/v1/debug/all-admins', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const adminsData = await adminsRes.json();
    
    if (adminsData.success) {
      console.log(`✅ Found ${adminsData.count} admin(s):`);
      console.table(adminsData.admins);
    } else {
      console.error('❌ Error:', adminsData.message);
    }
  } catch (e) {
    console.error('❌ Error fetching admins:', e.message);
  }

  console.log('\n');

  // Step 3: Get all notifications for current admin
  console.log('📋 STEP 3: Checking Your Notifications (Assigned to You)...');
  try {
    const notifRes = await fetch('http://localhost:5000/api/v1/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const notifData = await notifRes.json();
    
    if (notifData.success) {
      const count = notifData.data?.notifications?.length || 0;
      console.log(`✅ Your notifications: ${count}`);
      if (count > 0) {
        console.table(notifData.data.notifications.map(n => ({
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead ? 'Read' : 'Unread',
          createdAt: new Date(n.createdAt).toLocaleString(),
        })));
      } else {
        console.log('⚠️  No notifications assigned to you');
      }
    } else {
      console.error('❌ Error:', notifData.message);
    }
  } catch (e) {
    console.error('❌ Error fetching notifications:', e.message);
  }

  console.log('\n');

  // Step 4: Get ALL notifications in database for admins
  console.log('📋 STEP 4: Checking ALL Admin Notifications in Database...');
  try {
    const allRes = await fetch('http://localhost:5000/api/v1/debug/all-admin-notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const allData = await allRes.json();
    
    if (allData.success) {
      console.log(`✅ Total admin notifications in database: ${allData.count}`);
      if (allData.count > 0) {
        console.log('\n📧 Notifications by Admin:');
        console.table(allData.notifications);
        
        // Analyze which admin has notifications
        const byAdmin = {};
        allData.notifications.forEach(n => {
          const adminEmail = n.userEmail;
          byAdmin[adminEmail] = (byAdmin[adminEmail] || 0) + 1;
        });
        
        console.log('\n📊 Notifications Per Admin:');
        console.table(byAdmin);
      } else {
        console.log('⚠️  No notifications found in database!');
      }
    } else {
      console.error('❌ Error:', allData.message);
    }
  } catch (e) {
    console.error('❌ Error fetching all notifications:', e.message);
  }

  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                      DIAGNOSIS COMPLETE                          ║
╚═══════════════════════════════════════════════════════════════════╝

🔍 What to check:

1. ✅ Do your admin ID and the ID in "All Admin Notifications" match?
   - If NOT: Notifications are created for wrong admin
   
2. ✅ Are there notifications in the database?
   - If NO: Check backend logs for "Notification created" message
   
3. ✅ Is the admin email correct?
   - If NOT: Admin account may not be the one created with createAdmin.js

4. ✅ Is the notification type "admin_notification"?
   - If NOT: Wrong notification type is being created
  `);
}

// Run the diagnostic
diagnoseNotifications();

// You can also manually test with individual commands:
console.log(`
📌 Additional Debug Commands:

// Check your admin ID
localStorage.getItem('user') 

// Test notification fetch
fetch('http://localhost:5000/api/v1/notifications', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
}).then(r => r.json()).then(d => console.log(d))

// Check all notifications in database
fetch('http://localhost:5000/api/v1/debug/all-admin-notifications', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
}).then(r => r.json()).then(d => console.log(d))
  `);
