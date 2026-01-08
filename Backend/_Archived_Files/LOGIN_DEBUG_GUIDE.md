# Login Debugging Guide

## Overview
The login flow has been enhanced with detailed console logging to help identify exactly where the authentication process is failing.

## Step-by-Step Debug Instructions

### 1. **Open Browser Developer Tools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Click on the "Console" tab

### 2. **Prepare Your Test Credentials**
   Use one of these test accounts:
   - **Admin:** `spyboy000008@gmail.com` / `admin123`
   - **Job Seeker:** Any registered job seeker account
   - **Employer:** Any registered employer account

### 3. **Trigger Login Flow**
   - Go to http://localhost:3000
   - Click "Sign In"
   - Enter email and password
   - Click "Sign In" button

### 4. **Watch Console Output**
   Look for messages starting with `[SignIn]` in the console. The sequence should be:

   ```
   [SignIn] Attempting login with email: spyboy000008@gmail.com
   [SignIn] Response status: 200
   [SignIn] Response data: {success: true, message: "Login successful", data: {...}}
   [SignIn] Login successful!
   [SignIn] Token: eyJhbGc... (truncated)
   [SignIn] User: {id: "...", email: "...", role: "..."}
   [SignIn] Token saved: true
   [SignIn] User saved: true
   [SignIn] User role: admin
   [SignIn] Redirecting to /admin/overview
   ```

## Debugging Scenarios

### ❌ **Console shows no `[SignIn]` logs at all**
   - **Problem:** Form submission not being triggered
   - **Solution:** 
     - Check browser console for JavaScript errors
     - Verify `handleSubmit` is properly attached to the form
     - Try clearing browser cache (Ctrl+Shift+Delete)

### ❌ **Console shows `[SignIn] Attempting login...` but nothing after**
   - **Problem:** Fetch request not completing
   - **Solution:**
     - Open Network tab in DevTools
     - Check the request to `http://localhost:5000/api/v1/auth/login`
     - Verify backend is running on port 5000
     - Check for CORS errors

### ❌ **Console shows `Response status: 401` or `401`**
   - **Problem:** Invalid credentials
   - **Solution:**
     - Verify email/password are correct
     - Try the test credentials above
     - Check if user exists in database

### ❌ **Console shows `Response status: 500`**
   - **Problem:** Backend error
   - **Solution:**
     - Check backend server logs for errors
     - Verify MongoDB connection is working
     - Restart backend server with: `npm start` or `node server.js`

### ❌ **Console shows `Token saved: false` or `User saved: false`**
   - **Problem:** localStorage not accessible
   - **Solution:**
     - Check if browser is in private/incognito mode (disable it)
     - Check Application tab → Storage → Local Storage
     - Verify `localStorage.setItem()` works with test command in console:
       ```javascript
       localStorage.setItem('test', 'value')
       localStorage.getItem('test') // Should return 'value'
       ```

### ❌ **Console shows redirect command but page doesn't change**
   - **Problem:** Router.push() not redirecting
   - **Solution:**
     - Verify Next.js app is running
     - Try manually navigating to `/jobs` or `/admin/overview`
     - Check if ProtectedLayout is blocking the page (look for "Checking authentication..." message)

### ❌ **Page shows error message about CORS**
   - **Problem:** Backend CORS not allowing frontend domain
   - **Solution:**
     - Check backend `src/middleware/cors.js`
     - Verify it allows `http://localhost:3000`
     - Restart backend server

## Network Tab Inspection

1. Open **Network tab** in DevTools
2. Try to login
3. Look for the request to `/api/v1/auth/login`
4. Click on it and check:
   - **Status:** Should be 200 (not 401, 500, or CORS errors)
   - **Response:** Should show `{success: true, data: {token: "...", user: {...}}}`
   - **Headers:** Check `Content-Type: application/json`

## Troubleshooting Checklist

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] `NEXT_PUBLIC_API_URL` is set to `http://localhost:5000`
- [ ] MongoDB is connected (check backend startup logs)
- [ ] Test user account exists in database
- [ ] Browser console shows `[SignIn]` logs
- [ ] Network tab shows request to backend
- [ ] Backend response status is 200
- [ ] localStorage is accessible (not in private mode)
- [ ] No JavaScript errors in console

## Backend Check

If the issue is backend-related, verify:

```bash
# 1. Restart backend
cd Backend
npm start

# 2. Check logs for:
# ✓ "Server running on port 5000"
# ✓ "Mongoose connected"
# ✓ "User logged in: [user_id]" when you try to login
```

## Frontend Check

If the issue is frontend-related, verify:

```bash
# 1. Restart frontend
cd Frontend
npm run dev

# 2. Verify .env file
cat .env
# Should show: NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Quick Test Command

Run this in browser console to test localStorage:

```javascript
// Test localStorage
localStorage.setItem('testKey', 'testValue')
console.log('Test saved:', localStorage.getItem('testKey'))

// Test fetch to backend
fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'spyboy000008@gmail.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(d => console.log('Backend response:', d))
```

## Still Not Working?

Collect the following and share:
1. Complete `[SignIn]` console output
2. Network tab request/response for login API call
3. Backend startup logs
4. Any error messages (in red) in browser console
5. Screenshot of DevTools with Network tab showing the login request
