const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUserBan, updateUserRole, getAuditLogs, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/audit-logs', getAuditLogs);
router.get('/analytics', getAnalytics);
router.put('/users/:id/ban', toggleUserBan);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
