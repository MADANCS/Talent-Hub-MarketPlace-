const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateToken } = require('../utils/helpers');

// @desc   Register user
// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, company, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const userData = { name, email, password, role: role || 'CANDIDATE' };
    if (role === 'RECRUITER') { userData.company = company; userData.designation = designation; }

    const user = await User.create(userData);
    user.calculateProfileCompleteness();
    await user.save();

    // Welcome notification
    await Notification.create({
      recipient: user._id,
      type: 'SYSTEM_ALERT',
      title: 'Welcome to TalentHub! 🎉',
      message: `Welcome ${user.name}! Complete your profile to get the best matches.`,
      priority: 'HIGH'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profileCompleteness: user.profileCompleteness,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
    if (user.isBanned) return res.status(403).json({ success: false, message: `Account suspended: ${user.banReason}` });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Update Gamification Streak
    if (user.role === 'CANDIDATE') {
      const { updateStreak } = require('../utils/gamificationService');
      await updateStreak(user._id);
    }

    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        company: user.company,
        profileCompleteness: user.profileCompleteness,
        subscription: user.subscription,
        isOpenToWork: user.isOpenToWork,
        gamification: user.gamification
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    // Return the same normalized shape as the login/register responses
    // so the frontend AuthContext has a consistent user object regardless of
    // whether the user just logged in or refreshed the page.
    res.json({
      success: true,
      user: {
        _id:                  user._id,
        name:                 user.name,
        email:                user.email,
        role:                 user.role,
        avatar:               user.avatar,
        phone:                user.phone,
        location:             user.location,
        bio:                  user.bio,
        company:              user.company,
        designation:          user.designation,
        skills:               user.skills,
        experience:           user.experience,
        education:            user.education,
        resumeUrl:            user.resumeUrl,
        portfolioUrl:         user.portfolioUrl,
        linkedinUrl:          user.linkedinUrl,
        githubUrl:            user.githubUrl,
        expectedSalary:       user.expectedSalary,
        jobPreferences:       user.jobPreferences,
        isOpenToWork:         user.isOpenToWork,
        profileCompleteness:  user.profileCompleteness,
        subscription:         user.subscription,
        gamification:         user.gamification,
        savedJobs:            user.savedJobs,
        notificationPreferences: user.notificationPreferences,
        isEmailVerified:      user.isEmailVerified,
        profileViews:         user.profileViews,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// @desc   Generate 2FA Secret
// @route  POST /api/auth/2fa/generate
const generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const secret = speakeasy.generateSecret({
      name: `TalentHub (${user.email})`
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const dataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      qrCodeUrl: dataUrl,
      secret: secret.base32
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Enable 2FA
// @route  POST /api/auth/2fa/enable
const enable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      res.json({ success: true, message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, changePassword, generate2FA, enable2FA };
