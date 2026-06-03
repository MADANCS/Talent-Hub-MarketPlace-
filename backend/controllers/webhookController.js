const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getPlanFeatures } = require('../utils/helpers');

// @desc   Handle Razorpay Webhooks
// @route  POST /api/subscriptions/webhook
const handleWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  try {
    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      const notes = payment.notes;

      // Check if subscription already exists for this order
      const existingSub = await Subscription.findOne({ razorpayOrderId: orderId });
      if (!existingSub && notes.userId) {
        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        if (notes.billingCycle === 'MONTHLY') endDate.setMonth(endDate.getMonth() + 1);
        else endDate.setFullYear(endDate.getFullYear() + 1);

        // Create subscription
        await Subscription.create({
          user: notes.userId,
          plan: notes.plan,
          status: 'ACTIVE',
          razorpayOrderId: orderId,
          razorpayPaymentId: payment.id,
          amount: payment.amount / 100,
          currency: payment.currency,
          billingCycle: notes.billingCycle,
          startDate, endDate,
          features: getPlanFeatures(notes.plan)
        });

        // Update user
        await User.findByIdAndUpdate(notes.userId, {
          subscription: { plan: notes.plan, status: 'ACTIVE', startDate, endDate }
        });

        // Notify
        await Notification.create({
          recipient: notes.userId,
          type: 'SUBSCRIPTION_UPDATE',
          title: `🎉 Subscription Sync Successful!`,
          message: `Your payment was processed successfully. High-performance features are now online.`,
          priority: 'HIGH'
        });
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

module.exports = { handleWebhook };
