const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { validateUserRegistration, validateUserLogin } = require('../validators/userValidators');
const { authLimiter } = require('../middleware/rateLimit');
const authController = require('../controllers/authController');

// Public routes
router.post('/register', authLimiter, validate(validateUserRegistration), authController.register);
router.post('/login', authLimiter, validate(validateUserLogin), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', protect, authController.resendVerification);

module.exports = router;
