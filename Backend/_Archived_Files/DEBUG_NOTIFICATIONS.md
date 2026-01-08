/**
 * Comprehensive Notification System Debugging Guide
 * 
 * This guide helps verify the notification system is working end-to-end
 */

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║         NOTIFICATION SYSTEM - DEBUGGING & VERIFICATION           ║
╚═══════════════════════════════════════════════════════════════════╝

Step 1: VERIFY BACKEND IS RUNNING
================================
- Backend should be running on http://localhost:5000
- You should see logs like:
  ✓ Server running in development mode on port 5000
  ✓ MongoDB Connected

Step 2: VERIFY ADMIN IS LOGGED IN
=================================
Run this in browser console:
  JSON.parse(localStorage.getItem('user'))
  
Expected output should show:
  {
    id: "...",
    email: "spyboy000008@gmail.com",
    role: "admin"
  }

Step 3: GET THE AUTH TOKEN
==========================
Run this in browser console:
  localStorage.getItem('token')
  
This should return a long JWT token starting with "eyJ..."

Step 4: TEST NOTIFICATION API DIRECTLY
=======================================
Run this in browser console:

  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/v1/notifications', {
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Data:', data);
  
Expected response:
  {
    "success": true,
    "message": "Notifications retrieved successfully",
    "data": {
      "notifications": [...],
      "pagination": {...}
    }
  }

Step 5: CHECK ADMIN HEADER COMPONENT
====================================
- Open DevTools Console
- Look for logs starting with "[Notifications]"
- Examples:
  ✓ [Notifications] Fetching with token: eyJ...
  ✓ [Notifications] Response status: 200
  ✓ [Notifications] Notifications received: 2
  ✓ [Notifications] Unread count: 2

Step 6: TEST USER REGISTRATION FOR NOTIFICATIONS
=================================================
1. Start a NEW browser session (incognito/private)
2. Register a new job seeker account at http://localhost:3000/signup
3. Go back to admin dashboard
4. Check the bell icon - you should see a badge with count
5. Click the bell to see notifications

Step 7: VERIFY DATABASE
=======================
Check MongoDB directly for notifications:
  - Database: test
  - Collection: notifications
  - Query: { type: "admin_notification" }
  
MongoDB Compass / Atlas should show notifications like:
  {
    userId: ObjectId("...admin id..."),
    type: "admin_notification",
    title: "New Job Seeker Registered",
    message: "John Doe has registered as a job seeker",
    isRead: false,
    createdAt: ISODate("...")
  }

COMMON ISSUES & FIXES
====================

Issue: Bell shows 0 notifications
Fix: 
  1. Check admin is properly logged in: localStorage.getItem('user')
  2. Verify token exists: localStorage.getItem('token')
  3. Check browser console for [Notifications] logs
  4. Register a new user in a different session
  5. Click refresh button on notification dropdown

Issue: API returns 404 "Route not found"
Fix:
  1. Restart backend: cd Backend && node server.js
  2. Verify routes mounted in src/app.js
  3. Check src/routes/notificationRoutes.js exists

Issue: API returns 401 "Unauthorized"
Fix:
  1. Token may be expired - log out and log in again
  2. Make sure token is stored in localStorage
  3. Check token format is "Bearer <token>"

Issue: CORS error in browser console
Fix:
  1. Restart backend (CORS config updated)
  2. Check frontend is on http://localhost:3000
  3. Clear browser cache and cookies

QUICK TEST COMMAND
==================
Run this in browser console to see all details:

async function testNotif() {
  const token = localStorage.getItem('token');
  console.log('Token:', token ? '✓ Found' : '✗ Missing');
  
  try {
    const r = await fetch('http://localhost:5000/api/v1/notifications', {
      headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' }
    });
    console.log('Status:', r.status);
    const d = await r.json();
    console.log('Notifications:', d.data?.notifications?.length || 0);
    return d;
  } catch(e) {
    console.error('Error:', e.message);
  }
}
testNotif();
`);
