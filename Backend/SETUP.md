# Installation & Setup Guide

## Complete Backend Setup Instructions

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (Local or Cloud instance)
- Git

### Step 1: Clone & Navigate

```bash
cd Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express.js
- mongoose
- jsonwebtoken
- bcryptjs
- stripe
- cloudinary
- nodemailer
- winston
- jest
- And 20+ more dependencies

### Step 3: Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/canadajobs

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Email Service (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@canadajobs.com

# Stripe API Keys
STRIPE_PUBLIC_KEY=pk_test_your_public_key
STRIPE_SECRET_KEY=sk_test_your_secret_key

# Cloudinary
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Payment
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 4: Setup MongoDB

#### Option A: Local MongoDB
```bash
# Windows
mongod

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and cluster
3. Get connection string
4. Update MONGODB_URI in .env

### Step 5: Setup External Services

#### Stripe Account
1. Create account at https://stripe.com
2. Get API keys from Dashboard > API Keys
3. Add to .env

#### Cloudinary Account
1. Sign up at https://cloudinary.com
2. Get credentials from Dashboard
3. Add to .env

#### Gmail App Password
1. Enable 2-Factor Authentication on Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for Mail
4. Use this password in SMTP_PASS

### Step 6: Seed Database (Optional)

```bash
npm run seed
```

This creates sample data:
- 2 Job Seekers
- 2 Employers
- 2 Companies
- 2 Sample Jobs

### Step 7: Start Development Server

```bash
npm run dev
```

Expected output:
```
[INFO] Application started successfully
[INFO] Server is running on port 5000
[INFO] MongoDB connected to: mongodb://localhost:27017/canadajobs
[INFO] Cloudinary initialized
```

### Step 8: Test API

Open another terminal and test:

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "role": "jobseeker"
  }'
```

## Production Deployment

### 1. Build for Production

```bash
npm run build
```

### 2. Set Environment to Production

```env
NODE_ENV=production
```

### 3. Start Production Server

```bash
npm start
```

### 4. Deploy to Cloud (Example: Heroku)

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create canadajobs-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Build and Run

```bash
docker build -t canadajobs-api .
docker run -p 5000:5000 --env-file .env canadajobs-api
```

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solution:
1. Ensure MongoDB is running: mongod
2. Check MONGODB_URI in .env
3. Verify MongoDB is accessible
```

### Stripe API Error
```
Error: Invalid API Key

Solution:
1. Double-check STRIPE_SECRET_KEY in .env
2. Ensure it's not expired
3. Regenerate from Stripe Dashboard
```

### Cloudinary Upload Error
```
Error: Invalid credentials

Solution:
1. Verify CLOUDINARY_NAME, API_KEY, API_SECRET
2. Check credentials in Cloudinary Dashboard
3. Ensure account is active
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000

Solution:
Option 1: Kill process on port 5000
  lsof -ti:5000 | xargs kill -9

Option 2: Change PORT in .env
  PORT=5001
```

## Available Commands

```bash
# Development
npm run dev              # Start with hot reload

# Production
npm start               # Start production server

# Database
npm run seed           # Seed sample data

# Testing
npm test               # Run all tests
npm run test:watch    # Watch mode testing

# Maintenance
npm audit              # Check vulnerabilities
npm audit fix         # Fix vulnerabilities
npm update            # Update dependencies
```

## File Structure

```
Backend/
├── src/
│   ├── models/           # Database schemas
│   ├── controllers/      # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Custom middleware
│   ├── services/        # Services layer
│   ├── validators/      # Input validation
│   ├── utils/           # Helper functions
│   ├── config/          # Configuration
│   └── app.js           # Express app
├── scripts/
│   └── seed.js          # Database seeding
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── logs/                # Application logs
├── server.js            # Entry point
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## Development Workflow

1. **Start development server**: `npm run dev`
2. **Make code changes** in `src/` directory
3. **Changes auto-reload** (no restart needed)
4. **Check logs** in terminal and `./logs/` directory
5. **Test API** with Postman/Insomnia
6. **Commit changes**: `git add . && git commit -m "message"`

## API Documentation

Once server is running, access API at:
- Base URL: `http://localhost:5000`
- API Version: `/api/v1`
- Health: `http://localhost:5000/health`

Example endpoints:
- Auth: `POST /api/v1/auth/register`
- Users: `GET /api/v1/users/profile`
- Jobs: `GET /api/v1/jobs`
- Applications: `GET /api/v1/applications`

## Performance Tips

1. Use MongoDB indexes (already configured)
2. Enable caching with Redis
3. Use rate limiting (configured)
4. Compress responses with gzip
5. Monitor with Winston logging

## Security Checklist

- [ ] Change JWT_SECRET to strong value
- [ ] Keep .env file private
- [ ] Use HTTPS in production
- [ ] Enable CORS for allowed origins only
- [ ] Setup rate limiting
- [ ] Keep dependencies updated
- [ ] Use environment-specific configurations
- [ ] Enable MongoDB authentication
- [ ] Setup firewall rules
- [ ] Regular security audits

## Next Steps

1. Configure frontend to use backend API
2. Setup authentication flow
3. Test end-to-end workflows
4. Configure email notifications
5. Setup payment processing
6. Deploy to production

## Support

For issues:
1. Check logs in `./logs/` directory
2. Verify environment configuration
3. Check MongoDB connection
4. Verify external service credentials
5. Review error messages in console

---

**Setup Complete!** Your backend is ready for development. 🚀
