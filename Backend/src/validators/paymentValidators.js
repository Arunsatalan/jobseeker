const Joi = require('joi');

const validatePayment = Joi.object({
  amount: Joi.number().required().messages({
    'number.base': 'Valid amount is required',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().valid('CAD', 'USD', 'EUR').required().messages({
    'any.only': 'Invalid currency',
    'any.required': 'Currency is required'
  }),
  paymentMethod: Joi.string().valid('card', 'bank_transfer').required().messages({
    'any.only': 'Invalid payment method',
    'any.required': 'Payment method is required'
  })
});

const validateSubscription = Joi.object({
  plan: Joi.string().valid('free', 'pro', 'enterprise').required().messages({
    'any.only': 'Invalid subscription plan',
    'any.required': 'Subscription plan is required'
  }),
  billingCycle: Joi.string().valid('monthly', 'yearly').required().messages({
    'any.only': 'Invalid billing cycle',
    'any.required': 'Billing cycle is required'
  })
});

module.exports = {
  validatePayment,
  validateSubscription,
};
