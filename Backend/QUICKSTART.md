# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your settings:
- MongoDB connection string
- JWT secret
- Stripe keys
- Email credentials
- Cloudinary details

### 3. Start MongoDB
```bash
mongod
```

### 4. Seed Database (Optional)
```bash
npm run seed
```

### 5. Start Server
```bash
npm run dev
```

Server will be available at `http://localhost:5000`

## Testing Endpoints

### Register
```bash
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

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Get Jobs
```bash
curl http://localhost:5000/api/v1/jobs
```

### Health Check
```bash
curl http://localhost:5000/health
```

## Project Structure Summary

| Folder | Purpose |
|--------|---------|
| `src/models` | Database schemas (Mongoose) |
| `src/controllers` | Route handler logic |
| `src/routes` | API endpoint definitions |
| `src/middleware` | Express middleware |
| `src/services` | Business logic layer |
| `src/validators` | Input validation schemas |
| `src/utils` | Helper functions & constants |
| `src/config` | Configuration files |
| `scripts` | Database scripts |
| `tests` | Test files |

## Key Files

- **server.js** - Entry point
- **src/app.js** - Express app setup
- **src/config/database.js** - MongoDB connection
- **src/config/environment.js** - Environment config
- **.env.example** - Environment variables template

## Development Tips

1. **Hot Reload**: Changes auto-reload with `npm run dev`
2. **Logging**: Check logs in `./logs` directory
3. **Database**: Use MongoDB Compass to visualize data
4. **API Testing**: Use Postman or Insomnia

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env

### Port Already in Use
- Change PORT in .env (default: 5000)
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### Missing Dependencies
- Run: `npm install`
- Clear cache: `npm cache clean --force`

## Next Steps

1. Configure Stripe and Cloudinary credentials
2. Setup email service (Gmail app password)
3. Test authentication endpoints
4. Integrate with frontend
5. Deploy to production

For detailed API documentation, see `README.md` in Backend directory.
