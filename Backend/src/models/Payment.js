const mongoose = require('mongoose');
const constants = require('../utils/constants');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'CAD',
    },
    status: {
      type: String,
      enum: Object.values(constants.PAYMENT_STATUS),
      default: constants.PAYMENT_STATUS.PENDING,
    },
    paymentMethod: String,
    stripePaymentId: String,
    stripeInvoiceId: String,
    description: String,
    subscription: {
      plan: String,
      billingCycle: String,
      nextBillingDate: Date,
    },
    receipt: {
      url: String,
      number: String,
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
