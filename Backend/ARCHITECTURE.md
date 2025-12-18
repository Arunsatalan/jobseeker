# CanadaJobs Backend - Complete MVC Architecture

## 🎯 Project Overview

CanadaJobs is a full-stack job portal platform with an advanced backend built using Node.js/Express.js with MongoDB. The backend follows the MVC (Model-View-Controller) architectural pattern with comprehensive REST API endpoints.

## 📁 Project Structure

```
Backend/
├── src/
│   ├── models/                 # Mongoose schemas (9 models)
│   │   ├── User.js            # User authentication & profiles
│   │   ├── Job.js             # Job listings
│   │   ├── Resume.js          # Resume management
│   │   ├── Application.js     # Job applications
│   │   ├── Message.js         # Messaging system
│   │   ├── Payment.js         # Payment transactions
│   │   ├── Company.js         # Employer companies
│   │   ├── Notification.js    # User notifications
│   │   └── AdminLog.js        # Admin activity logs
│   │
│   ├── controllers/            # Route handlers (6 controllers)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── resumeController.js
│   │   ├── messagingController.js
│   │   ├── paymentController.js
│   │   └── adminController.js
│   │
│   ├── routes/                 # Route definitions (7 routers)
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── middleware/             # Express middleware (7 files)
│   │   ├── auth.js            # JWT authentication & authorization
│   │   ├── validation.js      # Input validation
│   │   ├── upload.js          # File upload with Cloudinary
│   │   ├── rateLimit.js       # Rate limiting
│   │   ├── cors.js            # CORS configuration
│   │   ├── errorHandler.js    # Global error handling
│   │   └── async.js           # Async handler wrapper
│   │
│   ├── services/              # Business logic (6 services)
│   │   ├── emailService.js
│   │   ├── paymentService.js
│   │   ├── resumeParserService.js
│   │   ├── searchService.js
│   │   ├── notificationService.js
│   │   └── analyticsService.js
│   │
│   ├── validators/            # Request validation (3 files)
│   │   ├── userValidators.js
│   │   ├── jobValidators.js
│   │   └── paymentValidators.js
│   │
│   ├── utils/                 # Utility functions (5 files)
│   │   ├── logger.js          # Winston logger
│   │   ├── errorResponse.js   # Error handling
│   │   ├── response.js        # Response formatting
│   │   ├── constants.js       # Constants & enums
│   │   └── helpers.js         # Helper functions
│   │
│   ├── config/                # Configuration (3 files)
│   │   ├── database.js        # MongoDB connection
│   │   ├── environment.js     # Environment variables
│   │   └── cloudinary.js      # Cloudinary setup
│   │
│   └── app.js                 # Express app setup
│
├── scripts/                    # Database scripts
│   └── seed.js                # Database seeding
│
├── tests/                     # Test files
│   ├── unit/
│   │   └── helpers.test.js
│   ├── integration/
│   │   └── auth.test.js
│   └── fixtures/
│       └── mockData.js
│
├── logs/                      # Application logs
├── public/uploads/            # File uploads directory
├── server.js                  # Server entry point
├── package.json               # Dependencies
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## 🛠 Tech Stack

### Core
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)

### External Services
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **Email**: Nodemailer (SMTP)
- **Caching**: Redis
- **Job Queue**: Bull

### Development Tools
- **Testing**: Jest
- **Logging**: Winston
- **Security**: Helmet, Express-mongo-sanitize, XSS-clean
- **Rate Limiting**: Express-rate-limit
- **File Upload**: Multer

## 📋 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password
- `GET /verify-email/:token` - Verify email
- `POST /resend-verification` - Resend verification email

### Users (`/api/v1/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /:id` - Get public profile
- `PUT /preferences` - Update job preferences
- `GET /preferences` - Get preferences
- `GET /admin/list` - List all users (Admin)
- `DELETE /:id` - Delete user (Admin)

### Jobs (`/api/v1/jobs`)
- `GET /` - Get all published jobs
- `GET /search` - Search jobs
- `GET /:id` - Get job details
- `POST /` - Create job (Employer)
- `PUT /:id` - Update job (Employer)
- `DELETE /:id` - Delete job (Employer/Admin)
- `GET /employer/jobs` - Get employer's jobs (Employer)

### Applications (`/api/v1/applications`)
- `POST /:jobId` - Apply for job (JobSeeker)
- `GET /` - Get applications
- `GET /:id` - Get application details
- `PUT /:id/status` - Update application status (Employer)
- `GET /employer/applications` - Get employer applications (Employer)
- `GET /admin/all` - Get all applications (Admin)

### Resumes (`/api/v1/resumes`)
- `POST /upload` - Upload resume (JobSeeker)
- `GET /` - Get resumes
- `GET /:id` - Get resume
- `PUT /:id` - Update resume
- `DELETE /:id` - Delete resume
- `POST /:id/set-default` - Set default resume

### Messages (`/api/v1/messages`)
- `POST /` - Send message
- `GET /conversation/:userId` - Get conversation
- `GET /` - Get all conversations
- `PUT /:id/read` - Mark as read

### Payments (`/api/v1/payments`)
- `POST /create-intent` - Create payment intent
- `POST /confirm` - Confirm payment
- `POST /subscribe` - Subscribe to plan
- `GET /subscription/status` - Get subscription status
- `POST /subscription/cancel` - Cancel subscription
- `GET /admin/transactions` - Get transactions (Admin)

### Admin (`/api/v1/admin`)
- `GET /dashboard` - Dashboard stats
- `GET /stats` - Platform statistics
- `GET /users` - List users (Admin)
- `PUT /users/:id/status` - Update user status (Admin)
- `DELETE /users/:id` - Delete user (Admin)
- `GET /jobs` - List jobs (Admin)
- `DELETE /jobs/:id` - Delete job (Admin)
- `PUT /jobs/:id/status` - Update job status (Admin)
- `GET /reports` - Get reports (Admin)
- `PUT /reports/:id/resolve` - Resolve report (Admin)
- `GET /settings` - Get settings (Admin)
- `PUT /settings` - Update settings (Admin)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. **Clone and setup:**
```bash
cd Backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB:**
```bash
mongod
```

4. **Seed database (optional):**
```bash
npm run seed
```

5. **Start server:**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## 📦 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run seed` - Seed database with sample data
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## 🔐 Environment Variables

See `.env.example` for all available variables:

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/canadajobs

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@canadajobs.com

# Stripe
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...

# Cloudinary
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🏗 Database Models

### User
- Authentication fields (password, tokens)
- Profile information
- Subscription and payment info
- Job preferences
- Resume management

### Job
- Job details (title, description, requirements)
- Employer reference
- Salary and location
- Status (draft, published, paused, expired, closed)
- Statistics and tags

### Application
- Job reference
- Applicant reference
- Cover letter and resume
- Application status tracking
- Interview scheduling

### Resume
- User reference
- File storage (Cloudinary)
- Parsed data (skills, experience, education)
- View count and primary status

### Message
- Sender and recipient references
- Message content and type
- Read status
- Related job reference

### Payment
- User and amount reference
- Payment status tracking
- Stripe integration
- Subscription details

### Company
- Company information
- Logo and banner images
- Social links
- Statistics (jobs, followers, reviews)
- Employee and job listings

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (Admin, Employer, JobSeeker)
- Password hashing with bcrypt
- Input validation with express-validator
- XSS protection
- CORS enabled
- Rate limiting
- MongoDB injection prevention
- Helmet security headers

## 📊 Database Indexes

All models include optimized indexes for:
- User email and role lookups
- Job status and employer queries
- Application tracking
- Message conversations
- Payment status tracking

## 🧪 Testing

Run unit and integration tests:
```bash
npm test
```

Test files included:
- Auth API tests
- Helper function tests
- Integration test fixtures

## 📝 Logging

Winston logger configured for:
- File logging with rotation
- Error logs
- Console output (development)
- Structured JSON format

Logs stored in `./logs` directory

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Commit with descriptive messages
4. Push and create pull request

## 📄 License

MIT License

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Last Updated**: 2024
**Version**: 1.0.0
