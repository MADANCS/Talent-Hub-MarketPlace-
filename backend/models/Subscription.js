const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['FREE','PRO','ENTERPRISE'], required: true },
  status: { type: String, enum: ['ACTIVE','INACTIVE','CANCELLED','EXPIRED','PENDING'], default: 'PENDING' },

  // Razorpay
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySubscriptionId: String,
  razorpaySignature: String,

  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  billingCycle: { type: String, enum: ['MONTHLY','YEARLY'], default: 'MONTHLY' },

  startDate: Date,
  endDate: Date,
  trialEndDate: Date,
  cancelledAt: Date,
  cancellationReason: String,

  features: {
    jobPostings: { type: Number, default: 0 }, // -1 = unlimited
    aiMatching: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    resumeDownloads: { type: Number, default: 0 },
    teamMembers: { type: Number, default: 1 }
  },

  invoices: [{
    invoiceId: String,
    amount: Number,
    status: String,
    paidAt: Date,
    downloadUrl: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
