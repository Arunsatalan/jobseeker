# CanadaJobs Backend API

A comprehensive backend API for the CanadaJobs platform built with Node.js, Express, and MongoDB following MVC architecture.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 👤 **User Management** - Job seekers, employers, and admin management
- 💼 **Job Management** - Complete job posting lifecycle
- 📄 **Resume Management** - Resume upload and ATS parsing
- 📧 **Messaging System** - Real-time messaging between users
- 💳 **Payment Processing** - Stripe integration for subscriptions
- 📊 **Analytics & Reporting** - Comprehensive analytics dashboard
- 🔍 **Advanced Search** - Elasticsearch-powered job search
- 📱 **Notifications** - Email and push notifications
- 🛡️ **Security** - CORS, Helmet, Rate limiting, XSS protection

## Prerequisites

- Node.js >= 14.0.0
- MongoDB >= 5.0
- Redis >= 6.0 (optional, for caching)
- Stripe Account
- Cloudinary Account (for image uploads)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/canadajobs-backend.git
cd canadajobs-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB:
```bash
mongod
```

5. Run the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route handlers
├── models/          # Mongoose schemas
├── routes/          # API routes
├── middleware/      # Custom middleware
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Input validation
└── app.js           # Express app setup
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account
- `PUT /api/users/:id/status` - Update user status (Admin)
- `GET /api/users/:id/stats` - Get user statistics

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `POST /api/jobs` - Create new job (Employer)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (Employer)
- `DELETE /api/jobs/:id` - Delete job (Employer/Admin)
- `POST /api/jobs/:id/apply` - Apply for job (Job Seeker)
- `GET /api/jobs/:id/applications` - Get job applications (Employer)

### Resumes
- `GET /api/resumes` - Get user's resumes
- `POST /api/resumes` - Upload new resume
- `GET /api/resumes/:id` - Get resume details
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Submit application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update application status

### Messages
- `GET /api/messages` - Get user's conversations
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Get conversation messages
- `DELETE /api/messages/:id` - Delete message

### Payments
- `GET /api/payments/plans` - Get subscription plans
- `POST /api/payments/subscribe` - Subscribe to plan
- `POST /api/payments/cancel` - Cancel subscription
- `GET /api/payments/history` - Get payment history

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/analytics` - Detailed analytics
- `GET /api/admin/users` - Manage users
- `POST /api/admin/moderation` - Content moderation
- `GET /api/admin/reports` - System reports

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Development

Start development server with hot reload:
```bash
npm run dev
```

## Database Seeding

Seed database with sample data:
```bash
npm run seed
```

## License

MIT License - see LICENSE file for details

## Support

For support, email support@canadajobs.com
