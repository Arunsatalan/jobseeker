const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { validatePayment, validateSubscription } = require('../validators/paymentValidators');
const validate = require('../middleware/validation');
const paymentController = require('../controllers/paymentController');

// Protected routes
router.post('/create-intent', protect, validate(validatePayment), paymentController.createPaymentIntent);
router.post('/confirm/:intentId', protect, paymentController.confirmPayment);
router.post('/subscribe', protect, validate(validateSubscription), paymentController.subscribe);
router.get('/subscription/status', protect, paymentController.getSubscriptionStatus);
router.post('/subscription/cancel', protect, paymentController.cancelSubscription);

// Admin routes
router.get('/admin/transactions', protect, authorize('admin'), paymentController.getAllTransactions);

module.exports = router;
