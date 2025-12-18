const Payment = require('../models/Payment');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

// @desc Create payment intent
// @route POST /api/v1/payments/create-intent
// @access Private
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { amount, currency } = req.body;

  const paymentIntent = await paymentService.createPaymentIntent(amount, currency);

  return sendSuccess(res, 201, 'Payment intent created', {
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc Confirm payment
// @route POST /api/v1/payments/confirm
// @access Private
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, amount } = req.body;

  const isConfirmed = await paymentService.confirmPayment(paymentIntentId);

  if (!isConfirmed) {
    return sendError(res, 400, 'Payment not confirmed');
  }

  // Create payment record
  const payment = await Payment.create({
    user: req.user._id,
    amount,
    status: 'completed',
    stripePaymentId: paymentIntentId,
  });

  logger.info(`Payment confirmed: ${payment._id}`);

  return sendSuccess(res, 201, 'Payment confirmed successfully', payment);
});

// @desc Subscribe to plan
// @route POST /api/v1/payments/subscribe
// @access Private
exports.subscribe = asyncHandler(async (req, res, next) => {
  const { plan, billingCycle } = req.body;

  // Get or create Stripe customer
  let user = await User.findById(req.user._id);

  if (!user.subscription.stripeId) {
    // Create Stripe customer first
    // This would integrate with Stripe API
  }

  // Create subscription
  const stripeSubscription = await paymentService.createSubscription(
    user.subscription.stripeId,
    plan
  );

  // Update user subscription
  user.subscription = {
    plan,
    status: 'active',
    startDate: new Date(),
    stripeId: stripeSubscription.id,
  };

  await user.save();

  logger.info(`User subscribed to plan: ${plan}`);

  return sendSuccess(res, 201, 'Subscription created successfully', user.subscription);
});

// @desc Get subscription status
// @route GET /api/v1/payments/subscription/status
// @access Private
exports.getSubscriptionStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('subscription');

  return sendSuccess(res, 200, 'Subscription status retrieved', user.subscription);
});

// @desc Cancel subscription
// @route POST /api/v1/payments/subscription/cancel
// @access Private
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.subscription.stripeId) {
    await paymentService.cancelSubscription(user.subscription.stripeId);
  }

  user.subscription.status = 'cancelled';
  await user.save();

  logger.info(`Subscription cancelled for user: ${user._id}`);

  return sendSuccess(res, 200, 'Subscription cancelled successfully');
});

// @desc Get all transactions (Admin)
// @route GET /api/v1/payments/admin/transactions
// @access Private/Admin
exports.getAllTransactions = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const payments = await Payment.find({})
    .populate('user', 'firstName lastName email')
    .limit(parseInt(limit))
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Payment.countDocuments({});

  return sendSuccess(res, 200, 'Transactions retrieved', {
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
