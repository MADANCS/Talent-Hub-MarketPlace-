const admin = require('firebase-admin');

// Initialize Firebase Admin (Requires service account in production)
// const serviceAccount = require('../config/firebase-service-account.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Dummy initialization to prevent crashing without credentials
if (process.env.FIREBASE_PROJECT_ID) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

/**
 * Send Push Notification via Firebase Cloud Messaging (FCM)
 */
const sendPushNotification = async (token, title, body, data = {}) => {
  if (!token) return;
  
  const message = {
    notification: {
      title,
      body,
    },
    data,
    token,
  };

  try {
    if (admin.apps.length > 0) {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent push notification:', response);
      return response;
    } else {
      console.log(`[FIREBASE MOCK] Push Notification to ${token}: ${title} - ${body}`);
      return true;
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

/**
 * Send Push Notification via Expo Push Service (Fallback for Expo Go)
 */
const sendExpoPushNotification = async (expoPushToken, title, body, data = {}) => {
  if (!expoPushToken) return;

  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const fetch = (await import('node-fetch')).default;
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    console.log(`[EXPO PUSH] Notification sent to ${expoPushToken}`);
  } catch (error) {
    console.error('Error sending Expo push notification:', error);
  }
};

module.exports = {
  sendPushNotification,
  sendExpoPushNotification
};
