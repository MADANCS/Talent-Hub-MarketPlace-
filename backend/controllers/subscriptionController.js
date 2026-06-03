const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getPlanFeatures } = require('../utils/helpers');

const PLANS = {
  PRO_MONTHLY:      { amount: 99900,  currency: 'INR', plan: 'PRO',        billingCycle: 'MONTHLY',  label: 'Pro Monthly' },
  PRO_YEARLY:       { amount: 999900, currency: 'INR', plan: 'PRO',        billingCycle: 'YEARLY',   label: 'Pro Yearly' },
  ENTERPRISE_MONTHLY:{ amount: 299900, currency: 'INR', plan: 'ENTERPRISE', billingCycle: 'MONTHLY', label: 'Enterprise Monthly' },
  ENTERPRISE_YEARLY: { amount: 2999900,currency: 'INR', plan: 'ENTERPRISE', billingCycle: 'YEARLY',  label: 'Enterprise Yearly' }
};

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_your_key_id') {
    return null;
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};

// @desc   Get subscription plans
// @route  GET /api/subscriptions/plans
const getPlans = async (req, res) => {
  res.json({
    success: true,
    plans: [
      { id: 'FREE', name: 'Free', price: 0, currency: 'INR', billingCycle: 'forever',
        features: getPlanFeatures('FREE'), popular: false,
        description: 'Perfect for getting started' },
      { id: 'PRO_MONTHLY', name: 'Pro', price: 999, currency: 'INR', billingCycle: 'month',
        features: getPlanFeatures('PRO'), popular: true,
        description: 'Best for growing teams' },
      { id: 'PRO_YEARLY', name: 'Pro Yearly', price: 9999, currency: 'INR', billingCycle: 'year',
        features: getPlanFeatures('PRO'), popular: false,
        description: 'Save 17% with yearly billing', savings: '2000' },
      { id: 'ENTERPRISE_MONTHLY', name: 'Enterprise', price: 2999, currency: 'INR', billingCycle: 'month',
        features: getPlanFeatures('ENTERPRISE'), popular: false,
        description: 'For large organizations' }
    ]
  });
};

// @desc   Create order
// @route  POST /api/subscriptions/create-order
const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const planConfig = PLANS[planId];
    if (!planConfig) return res.status(400).json({ success: false, message: 'Invalid plan' });

    const razorpay = getRazorpay();
    if (!razorpay) {
      // Demo mode — simulate success
      return res.json({
        success: true,
        demo: true,
        order: { id: `demo_order_${Date.now()}`, amount: planConfig.amount, currency: planConfig.currency },
        key: 'rzp_test_demo',
        planConfig
      });
    }

    const order = await razorpay.orders.create({
      amount: planConfig.amount,
      currency: planConfig.currency,
      receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
      notes: { userId: req.user._id.toString(), plan: planConfig.plan, billingCycle: planConfig.billingCycle }
    });

    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID, planConfig });
  } catch (error) {
    console.error("ERROR IN CREATEORDER:", error);
    res.status(500).json({ success: false, message: error.message || error });
  }
};

// @desc   Verify payment & activate subscription
// @route  POST /api/subscriptions/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, demo } = req.body;
    const planConfig = PLANS[planId];
    if (!planConfig) return res.status(400).json({ success: false, message: 'Invalid plan' });

    // Verify signature (skip in demo mode)
    if (!demo) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (planConfig.billingCycle === 'MONTHLY') endDate.setMonth(endDate.getMonth() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    // Create subscription record
    const subscription = await Subscription.create({
      user: req.user._id,
      plan: planConfig.plan,
      status: 'ACTIVE',
      razorpayOrderId: razorpay_order_id || `demo_${Date.now()}`,
      razorpayPaymentId: razorpay_payment_id || `demo_pay_${Date.now()}`,
      amount: planConfig.amount / 100,
      currency: planConfig.currency,
      billingCycle: planConfig.billingCycle,
      startDate, endDate,
      features: getPlanFeatures(planConfig.plan)
    });

    // Update user subscription
    await User.findByIdAndUpdate(req.user._id, {
      subscription: { plan: planConfig.plan, status: 'ACTIVE', startDate, endDate }
    });

    // Notify user
    await Notification.create({
      recipient: req.user._id,
      type: 'SUBSCRIPTION_UPDATE',
      title: `🎉 ${planConfig.label} Plan Activated!`,
      message: `Your ${planConfig.label} subscription is now active. Enjoy all premium features!`,
      priority: 'HIGH'
    });

    res.json({ success: true, message: 'Subscription activated successfully!', subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get my subscription
// @route  GET /api/subscriptions/my-subscription
const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'ACTIVE' }).sort('-createdAt');
    const user = await User.findById(req.user._id).select('subscription');
    res.json({ success: true, subscription, userSubscription: user.subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPlans, createOrder, verifyPayment, getMySubscription };
