// ============================================================================
// CanadaJobs Login Flow Quick Test
// ============================================================================
// Run this script in the browser console (F12 → Console tab) to quickly test
// the login flow and identify issues.
//
// Instructions:
// 1. Open http://localhost:3000 in browser
// 2. Press F12 to open DevTools
// 3. Click "Console" tab
// 4. Copy this entire script
// 5. Paste it into the console and press Enter
// 6. Follow the prompts
//
// ============================================================================

console.log('='.repeat(80))
console.log('CanadaJobs - Login Flow Test Suite')
console.log('='.repeat(80))

const API_URL = 'http://localhost:5000'
const TEST_EMAIL = 'spyboy000008@gmail.com'
const TEST_PASSWORD = 'admin123'

// Test 1: Check localStorage availability
console.log('\n[TEST 1] Checking localStorage availability...')
try {
  localStorage.setItem('_test_key_', 'test_value')
  const retrieved = localStorage.getItem('_test_key_')
  if (retrieved === 'test_value') {
    console.log('✅ localStorage is working correctly')
    localStorage.removeItem('_test_key_')
  } else {
    console.error('❌ localStorage retrieval failed')
  }
} catch (e) {
  console.error('❌ localStorage not available:', e.message)
  console.log('   (You may be in private/incognito mode - disable it)')
}

// Test 2: Check API endpoint connectivity
console.log('\n[TEST 2] Checking backend connectivity...')
fetch(`${API_URL}/api/v1/auth/verify-token`, {
  method: 'GET',
  headers: { 'Authorization': 'Bearer invalid_token' }
})
  .then(r => {
    if (r.status === 401 || r.status === 200) {
      console.log('✅ Backend is reachable at', API_URL)
    } else {
      console.warn('⚠️ Backend responded with status:', r.status)
    }
    return r.json()
  })
  .catch(e => {
    console.error('❌ Cannot connect to backend:', e.message)
    console.log('   Make sure backend is running: npm start in Backend folder')
  })

// Test 3: Check environment variables
console.log('\n[TEST 3] Checking environment variables...')
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET')
if (process.env.NEXT_PUBLIC_API_URL === 'http://localhost:5000') {
  console.log('✅ API URL is correctly configured')
} else {
  console.warn('⚠️ API URL might be misconfigured')
}

// Test 4: Perform actual login
console.log('\n[TEST 4] Attempting login with test credentials...')
console.log('Email:', TEST_EMAIL)
console.log('Note: Password is hidden for security')

fetch(`${API_URL}/api/v1/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  })
})
  .then(async (response) => {
    console.log('📡 Response status:', response.status)
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Login successful!')
      console.log('   Token:', data.data.token.substring(0, 30) + '...')
      console.log('   User:', data.data.user)
      
      // Test 5: Try to save to localStorage
      console.log('\n[TEST 5] Testing localStorage save...')
      try {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        
        if (savedToken && savedUser) {
          console.log('✅ Token and user saved to localStorage')
          console.log('   Token in storage:', savedToken.substring(0, 30) + '...')
          console.log('   User in storage:', JSON.parse(savedUser))
        } else {
          console.error('❌ Failed to save to localStorage')
        }
      } catch (e) {
        console.error('❌ localStorage error:', e.message)
      }
      
      // Test 6: Verify cookie
      console.log('\n[TEST 6] Checking session cookies...')
      if (document.cookie.includes('auth_token')) {
        console.log('✅ Auth token cookie is set')
      } else {
        console.warn('⚠️ Auth token cookie not found')
      }
    } else {
      console.error('❌ Login failed')
      console.error('   Message:', data.message)
      console.error('   Response:', data)
    }
  })
  .catch(e => {
    console.error('❌ Login request failed:', e.message)
    if (e.message === 'Failed to fetch') {
      console.log('   Possible causes:')
      console.log('   - Backend is not running on port 5000')
      console.log('   - Network is disconnected')
      console.log('   - CORS is blocked')
    }
  })

console.log('\n' + '='.repeat(80))
console.log('Tests initiated. Check above for results.')
console.log('='.repeat(80))

// Export test functions for manual testing
window.testLogin = async () => {
  console.log('Running manual login test...')
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  })
  const data = await response.json()
  console.log('Login response:', data)
  return data
}

window.testStorage = () => {
  console.log('localStorage test:')
  const stored = {
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user')
  }
  console.log('Stored data:', stored)
  return stored
}

window.testAuth = () => {
  console.log('AuthContext test:')
  console.log('Note: AuthContext is not directly accessible without exporting it')
  console.log('Check the React DevTools extension for AuthContext details')
}

console.log('\n💡 Available helper functions:')
console.log('   - testLogin()  : Run login again')
console.log('   - testStorage() : Check localStorage')
console.log('   - testAuth()   : Check AuthContext')
