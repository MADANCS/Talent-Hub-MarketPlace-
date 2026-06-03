const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/',              protect, getNotifications);
router.get('/unread-count',  protect, getUnreadCount);
router.put('/read-all',      protect, markAllRead);
router.delete('/clear-all',  protect, clearAllNotifications);
router.put('/:id/read',      protect, markAsRead);
router.delete('/:id',        protect, deleteNotification);

module.exports = router;
