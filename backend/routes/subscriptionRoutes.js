const express = require('express');
const router = express.Router();
const { getPlans, createOrder, verifyPayment, getMySubscription } = require('../controllers/subscriptionController');
const { handleWebhook } = require('../controllers/webhookController');
const { protect } = require('../middleware/auth');

router.get('/plans', getPlans);
router.get('/my-subscription', protect, getMySubscription);
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
