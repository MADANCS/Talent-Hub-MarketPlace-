const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// @desc   Admin dashboard stats
// @route  GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, totalJobs, totalApplications,
      candidatesCount, recruitersCount,
      activeJobs, hiredCount,
      recentUsers, recentJobs
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      User.countDocuments({ role: 'CANDIDATE' }),
      User.countDocuments({ role: 'RECRUITER' }),
      Job.countDocuments({ status: 'ACTIVE' }),
      Application.countDocuments({ status: 'HIRED' }),
      User.find().sort('-createdAt').limit(5).select('name email role createdAt avatar'),
      Job.find().sort('-createdAt').limit(5).populate('recruiter', 'name company')
    ]);

    // Growth metrics (last 30 days vs previous 30)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const newUsersLast30 = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newUsersPrev30 = await User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });

    res.json({
      success: true,
      stats: {
        totalUsers, totalJobs, totalApplications,
        candidatesCount, recruitersCount, activeJobs, hiredCount,
        userGrowth: newUsersPrev30 > 0 ? Math.round(((newUsersLast30 - newUsersPrev30) / newUsersPrev30) * 100) : 100,
        newUsersLast30
      },
      recentUsers, recentJobs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all users
// @route  GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password');

    res.json({ success: true, users, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Ban/unban user
// @route  PUT /api/admin/users/:id/ban
const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'ADMIN') return res.status(403).json({ success: false, message: 'Cannot ban an admin' });

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? (req.body.reason || 'Violation of terms of service') : '';
    await user.save();

    if (user.isBanned) {
      await Notification.create({
        recipient: user._id,
        type: 'SYSTEM_ALERT',
        title: 'Account Suspended',
        message: `Your account has been suspended. Reason: ${user.banReason}`,
        priority: 'URGENT'
      });
    }

    res.json({ success: true, message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update user role
// @route  PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get audit logs
// @route  GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, logs, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get platform analytics
// @route  GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    // Applications by status
    const appsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Jobs by type
    const jobsByType = await Job.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } }
    ]);

    // Top hiring companies
    const topCompanies = await Job.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$company', jobCount: { $sum: 1 }, applications: { $sum: '$applicationCount' } } },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ]);

    // Monthly registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyReg = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, analytics: { appsByStatus, jobsByType, topCompanies, monthlyReg } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserBan, updateUserRole, getAuditLogs, getAnalytics };
