const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, generate2FA, enable2FA } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

// 2FA Security Routes
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/enable', protect, enable2FA);

module.exports = router;
