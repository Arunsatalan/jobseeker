# 🚀 Setup OpenAI API for Smart Apply

## Current Status
❌ **GPT API is NOT working** - Using fallback dummy data
✅ **Frontend is ready** - Calling the correct endpoints
✅ **Backend is ready** - Waiting for API key

## Why It's Not Working

The backend code checks for `process.env.OPENAI_API_KEY`. If it's not found, it automatically uses fallback mode with dummy data instead of real GPT analysis.

## How to Fix (2 Minutes)

### Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in (or create account if you don't have one)
3. Click **"Create new secret key"**
4. **IMPORTANT**: Copy the key immediately (starts with `sk-`)
5. You won't be able to see it again!

### Step 2: Add API Key to .env File

Open `Backend/.env` file and add these lines:

```env
# OpenAI Configuration for Smart Apply AI
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

**Replace `sk-your-actual-api-key-here` with your actual API key!**

### Step 3: Restart Backend Server

```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
cd Backend
npm run dev
```

### Step 4: Test It!

1. Open your job search page
2. Click "Apply" on any job
3. Watch the Smart Apply modal
4. You should see:
   - "Analyzing your profile with AI..." (takes 2-5 seconds)
   - Real GPT-generated analysis
   - Personalized cover letter
   - Job-specific recommendations

## How to Verify It's Working

### Check Backend Console

You should see:
```
AI routes mounted at /api/v1/ai
Profile analysis completed for user...
Cover letter generated for user...
```

**NOT this** (fallback mode):
```
OpenAI API key not configured, using fallback analysis
```

### Check Frontend Console (Browser DevTools)

You should see:
```javascript
Calling AI analyze-profile API for job: 694cf4891acee4ef9815e421
AI analyze-profile API response: { success: true, data: { matchPercentage: 87, ... } }
```

### Check the Analysis Quality

**Fallback Mode (dummy data)**:
- Generic suggestions
- Same match percentage every time
- Template cover letters
- Instant response

**Real GPT Mode**:
- Personalized analysis
- Different match percentages per job
- Unique cover letters
- Takes 2-5 seconds (API call time)

## Cost Information

**GPT-3.5-turbo** (Recommended):
- ~$0.005 per application (half a cent!)
- 100 applications = ~$0.50
- 1000 applications = ~$5.00

**Very affordable!** Perfect for development and production.

## Troubleshooting

### "Still seeing dummy data"

**Check:**
1. ✅ API key is in `.env` file
2. ✅ No typos in the key
3. ✅ Backend server was restarted
4. ✅ `.env` file is in `Backend/` folder (not `Frontend/`)

**Test API key:**
```bash
# In Backend folder
node -e "require('dotenv').config(); console.log('API Key:', process.env.OPENAI_API_KEY ? 'Found' : 'Not Found')"
```

### "API call failed"

**Possible reasons:**
1. Invalid API key
2. No credits in OpenAI account
3. Rate limit reached
4. Network issue

**Check OpenAI dashboard:**
- https://platform.openai.com/usage
- Verify you have credits
- Check API usage

### "CORS errors"

The frontend is already configured to call `http://localhost:5000/api/v1/ai/*`

If you see CORS errors:
1. Ensure backend is running on port 5000
2. Check `FRONTEND_URL` in backend `.env`
3. Restart both servers

## Example .env File

Here's what your complete `.env` should look like:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/jobseeker

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# OpenAI Configuration (REQUIRED for Smart Apply AI)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password

# Redis
REDIS_URL=redis://localhost:6379

# Frontend
FRONTEND_URL=http://localhost:3000
```

## What Happens After Setup

### Before (Fallback Mode)
```
User clicks "Apply"
  ↓
Frontend calls API
  ↓
Backend: "No API key found"
  ↓
Backend: "Using fallback analysis"
  ↓
Returns dummy data instantly
```

### After (Real GPT Mode)
```
User clicks "Apply"
  ↓
Frontend calls API
  ↓
Backend: "API key found!"
  ↓
Backend calls OpenAI GPT
  ↓
GPT analyzes profile (2-5 seconds)
  ↓
Returns real AI analysis
```

## Next Steps

1. ✅ Add API key to `.env`
2. ✅ Restart backend
3. ✅ Test Smart Apply
4. ✅ Check console logs
5. ✅ Verify real GPT responses

## Support

If you're still having issues:

1. Check backend logs for errors
2. Check frontend console for API responses
3. Verify API key is valid on OpenAI dashboard
4. Test with a simple curl command:

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

**Once you add the API key and restart, the Smart Apply will use REAL GPT analysis!** 🎉
