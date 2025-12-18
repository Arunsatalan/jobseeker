const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../config/environment');
const logger = require('../utils/logger');

class PaymentService {
  async createPaymentIntent(amount, currency = 'cad', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
      });

      logger.info(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error(`Failed to create payment intent: ${error.message}`);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      logger.error(`Failed to confirm payment: ${error.message}`);
      throw error;
    }
  }

  async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
      });

      logger.info(`Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      logger.error(`Failed to create subscription: ${error.message}`);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.del(subscriptionId);
      logger.info(`Subscription cancelled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      logger.error(`Failed to cancel subscription: ${error.message}`);
      throw error;
    }
  }

  async createRefund(paymentIntentId, amount = null) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount && { amount: Math.round(amount * 100) }),
      });

      logger.info(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error(`Failed to create refund: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new PaymentService();
