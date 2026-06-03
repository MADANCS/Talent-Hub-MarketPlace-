const mongoose = require('mongoose');
const { sendExpoPushNotification, sendPushNotification } = require('../utils/firebaseService');
const User = require('./User');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'APPLICATION_RECEIVED','APPLICATION_STATUS_CHANGE','NEW_JOB_MATCH',
      'INTERVIEW_SCHEDULED','INTERVIEW_REMINDER','OFFER_RECEIVED',
      'PROFILE_VIEWED','MESSAGE_RECEIVED','SUBSCRIPTION_UPDATE',
      'SYSTEM_ALERT','JOB_EXPIRING','AI_MATCH_FOUND'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  priority: { type: String, enum: ['LOW','NORMAL','HIGH','URGENT'], default: 'NORMAL' }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Post-save hook to trigger push notifications automatically
notificationSchema.post('save', async function(doc, next) {
  try {
    const user = await User.findById(doc.recipient).select('+expoPushToken +fcmToken +notificationPreferences');
    if (!user) return next();

    // Check user preferences
    if (user.notificationPreferences?.push === false) return next();

    // Prefer Expo Push Token if available, otherwise FCM
    if (user.expoPushToken) {
      await sendExpoPushNotification(user.expoPushToken, doc.title, doc.message, doc.data);
    } else if (user.fcmToken) {
      await sendPushNotification(user.fcmToken, doc.title, doc.message, doc.data);
    }
    
    next();
  } catch (error) {
    console.error('Error in notification post-save hook:', error);
    next();
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
