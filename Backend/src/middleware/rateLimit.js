const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (development)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Disable rate limiting in development
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs (development)
  message: 'Too many login attempts, please try again after 15 minutes',
  skipSuccessfulRequests: true,
  skip: (req) => process.env.NODE_ENV === 'development', // Disable rate limiting in development
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per hour (development)
  message: 'Too many file uploads, please try again after 1 hour',
  skip: (req) => process.env.NODE_ENV === 'development', // Disable rate limiting in development
});

module.exports = {
  limiter,
  authLimiter,
  uploadLimiter,
};
