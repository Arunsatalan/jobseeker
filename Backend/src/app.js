const express = require('express');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const config = require('./config/environment');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { limiter } = require('./middleware/rateLimit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const jobRoutes = require('./routes/jobRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const messageRoutes = require('./routes/messageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const companyRoutes = require('./routes/companyRoutes');
const debugRoutes = require('./routes/debugRoutes');
const jobSeekerPreferencesRoutes = require('./routes/jobSeekerPreferencesRoutes');
const cvRoutes = require('./routes/cvRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(corsMiddleware);

// Rate limiting
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Debug test page
app.use('/test', express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/user-profiles', userProfileRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/jobseeker', jobSeekerPreferencesRoutes);
app.use('/api/v1/cv', cvRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/debug', debugRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
