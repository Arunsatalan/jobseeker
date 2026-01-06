# Login Testing Quick Reference

## ⚡ 30-Second Test

1. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd Backend && npm start
   
   # Terminal 2: Frontend  
   cd Frontend && npm run dev
   ```

2. **Open Browser**
   - Go to http://localhost:3000
   - Press F12 (DevTools)
   - Click "Console" tab

3. **Login**
   - Click "Sign In"
   - Enter: `spyboy000008@gmail.com` / `admin123`
   - Click "Sign In"

4. **Check Results**
   - Look for `[SignIn]` logs in console
   - Should see redirect message if successful

---

## 📊 Expected Behavior

### ✅ SUCCESS PATH
```
[SignIn] Attempting login...
[SignIn] Response status: 200
[SignIn] Login successful!
[SignIn] Token saved: true
[SignIn] User saved: true
[SignIn] Redirecting to /admin/overview
→ Page redirects to dashboard
```

### ❌ FAILURE PATHS

**Backend not running:**
```
❌ Failed to fetch
Error: Unable to connect to server
```
→ Start backend: `npm start` in Backend folder

**Wrong credentials:**
```
[SignIn] Response status: 401
❌ Invalid credentials
```
→ Try: `spyboy000008@gmail.com` / `admin123`

**Network issue:**
```
[SignIn] Network error: Failed to fetch
```
→ Check NEXT_PUBLIC_API_URL = http://localhost:5000

---

## 🔍 Debugging Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] NEXT_PUBLIC_API_URL set correctly
- [ ] Browser not in incognito mode
- [ ] DevTools console open
- [ ] Credentials are correct

---

## 📱 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | spyboy000008@gmail.com | admin123 |
| Job Seeker | (use registered account) | (use password) |
| Employer | (use registered account) | (use password) |

---

## 🛠️ Quick Fixes

### Can't connect to backend
```bash
cd Backend
npm start
# Should show: "Server running on port 5000"
```

### Frontend not updating
```bash
# Clear Next.js cache
rm -rf Frontend/.next
cd Frontend
npm run dev
```

### localStorage not working
- Exit private/incognito mode
- Try different browser
- Check DevTools → Application → Storage

### Still stuck?
1. Copy all `[SignIn]` console logs
2. Check Network tab request/response
3. Check backend terminal output
4. Share these details for help

---

## 🔗 Related Files

- [LOGIN_DEBUG_GUIDE.md](./LOGIN_DEBUG_GUIDE.md) - Detailed debugging
- [LOGIN_STATUS_REPORT.md](./LOGIN_STATUS_REPORT.md) - Recent improvements
- [LOGIN_TEST_SCRIPT.js](./LOGIN_TEST_SCRIPT.js) - Automated tests
- [Frontend/components/signin.tsx](./Frontend/components/signin.tsx) - Login form
- [Frontend/contexts/AuthContext.tsx](./Frontend/contexts/AuthContext.tsx) - Auth state
- [Backend/src/controllers/authController.js](./Backend/src/controllers/authController.js) - Login API

---

## 💡 Tips

- **Clear browser data:** Ctrl+Shift+Delete → Clear localStorage
- **Check Network tab:** DevTools → Network → Filter to XHR → Try login
- **Test in Console:** Paste code from LOGIN_TEST_SCRIPT.js
- **Watch logs:** Keep backend terminal visible while testing

---

## 📝 Common Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| No logs in console | Form not submitting | Check browser console for JS errors |
| Logs stop after status | Backend not responding | Restart backend |
| Token not saving | localStorage blocked | Disable private mode |
| No redirect after success | Router not working | Check Next.js middleware |
| CORS error | Backend CORS config | Check cors.js in middleware |

---

## ✨ Success Indicators

When login works, you should see:
1. ✅ API response status 200
2. ✅ Token in localStorage
3. ✅ User data in localStorage
4. ✅ Page redirect to dashboard
5. ✅ Protected routes accessible

If any of these is missing, check the corresponding section in [LOGIN_DEBUG_GUIDE.md](./LOGIN_DEBUG_GUIDE.md)
