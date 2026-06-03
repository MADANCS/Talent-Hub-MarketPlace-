const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { parseResumeWithAI } = require('../utils/aiService');

// @desc   Get user profile
// @route  GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs', 'title company location jobType salaryMin salaryMax status');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update user profile
// @route  PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const blocked = ['password', 'role', 'email', 'isBanned', 'isActive', 'savedJobs'];
    blocked.forEach(f => delete req.body[f]);

    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
    user.calculateProfileCompleteness();
    await user.save();

    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Search candidates (recruiter/admin)
// @route  GET /api/users/candidates
const searchCandidates = async (req, res) => {
  try {
    const { skills, location, search, minExperience, isOpenToWork, page = 1, limit = 20 } = req.query;
    const query = { role: 'CANDIDATE', isActive: true, isBanned: false };

    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } }
    ];
    if (skills) {
      const skillArr = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArr };
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (isOpenToWork === 'true') query.isOpenToWork = true;

    const total = await User.countDocuments(query);
    const candidates = await User.find(query)
      .select('name email avatar skills experience education location bio isOpenToWork profileCompleteness linkedinUrl githubUrl')
      .sort('-profileCompleteness')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, candidates, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get candidate public profile
// @route  GET /api/users/candidates/:id
const getCandidateProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'CANDIDATE' })
      .select('-password -emailVerifyToken -passwordResetToken -passwordResetExpires -savedJobs');
    if (!user) return res.status(404).json({ success: false, message: 'Candidate not found' });

    // Increment profile views
    await User.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update notification preferences
// @route  PUT /api/users/notification-preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences: req.body },
      { new: true }
    );
    res.json({ success: true, message: 'Preferences updated', preferences: user.notificationPreferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Parse resume with AI
// @route  POST /api/users/parse-resume
const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const extractedData = await parseResumeWithAI(req.file.buffer);

    res.json({
      success: true,
      message: 'Resume parsed successfully',
      data: extractedData
    });
  } catch (error) {
    console.error('Resume Parse Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update Push Notification Token
// @route  PUT /api/users/push-token
const updatePushToken = async (req, res) => {
  try {
    const { expoPushToken, fcmToken } = req.body;
    
    const updates = {};
    if (expoPushToken) updates.expoPushToken = expoPushToken;
    if (fcmToken) updates.fcmToken = fcmToken;

    await User.findByIdAndUpdate(req.user._id, updates);
    res.json({ success: true, message: 'Push token updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get Candidate Leaderboard
// @route  GET /api/users/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ role: 'CANDIDATE' })
      .select('name avatar gamification.level gamification.experience gamification.rank gamification.badges')
      .sort({ 'gamification.experience': -1 })
      .limit(10);

    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── BOOKMARK / SAVE JOB ─────────────────────────────────────────────────────

// @desc   Save (bookmark) a job
// @route  POST /api/users/saved-jobs/:jobId
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { savedJobs: jobId } },
      { new: true }
    );
    res.json({ success: true, message: 'Job saved', savedCount: user.savedJobs.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Unsave (remove bookmark) a job
// @route  DELETE /api/users/saved-jobs/:jobId
const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { savedJobs: jobId } },
      { new: true }
    );
    res.json({ success: true, message: 'Job removed from saved', savedCount: user.savedJobs.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get all saved jobs for current user
// @route  GET /api/users/saved-jobs
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedJobs',
        populate: { path: 'recruiter', select: 'name company avatar' }
      });
    res.json({ success: true, savedJobs: user.savedJobs || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── AI RESUME SCORE ──────────────────────────────────────────────────────────

// @desc   Get AI-powered resume score & tips
// @route  GET /api/users/resume-score
const getResumeScore = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Compute score from profile completeness signals
    const sections = {
      contact:     { score: 0, max: 15, tips: [] },
      skills:      { score: 0, max: 25, tips: [] },
      experience:  { score: 0, max: 25, tips: [] },
      education:   { score: 0, max: 15, tips: [] },
      links:       { score: 0, max: 10, tips: [] },
      resume:      { score: 0, max: 10, tips: [] },
    };

    // Contact
    if (user.phone)    sections.contact.score += 5; else sections.contact.tips.push('Add your phone number');
    if (user.location) sections.contact.score += 5; else sections.contact.tips.push('Add your city/location');
    if (user.bio && user.bio.length > 80) sections.contact.score += 5; else sections.contact.tips.push('Write a professional summary (80+ chars)');

    // Skills
    const skillCount = user.skills?.length || 0;
    sections.skills.score = Math.min(25, skillCount * 3);
    if (skillCount < 5)  sections.skills.tips.push('Add at least 5 skills');
    if (skillCount < 10) sections.skills.tips.push('10+ skills improves recruiter visibility by 3×');

    // Experience
    const expCount = user.experience?.length || 0;
    sections.experience.score = Math.min(25, expCount * 10);
    if (expCount === 0) sections.experience.tips.push('Add at least one work experience');
    const missingDesc = user.experience?.filter(e => !e.description || e.description.length < 50) || [];
    if (missingDesc.length > 0) sections.experience.tips.push('Add detailed descriptions to each role (50+ chars)');

    // Education
    const eduCount = user.education?.length || 0;
    sections.education.score = Math.min(15, eduCount * 8);
    if (eduCount === 0) sections.education.tips.push('Add your highest education');

    // Links
    if (user.linkedinUrl)  sections.links.score += 5; else sections.links.tips.push('Add your LinkedIn URL');
    if (user.githubUrl)    sections.links.score += 3; else sections.links.tips.push('Add your GitHub URL');
    if (user.portfolioUrl) sections.links.score += 2; else sections.links.tips.push('Add a portfolio/website link');

    // Resume file
    if (user.resumeUrl)  sections.resume.score += 6; else sections.resume.tips.push('Upload your resume PDF');
    if (user.resumeText && user.resumeText.length > 200) sections.resume.score += 4;
    else sections.resume.tips.push('Ensure your resume is text-parseable (not just a scan)');

    const totalScore = Object.values(sections).reduce((s, v) => s + v.score, 0);
    const maxScore   = Object.values(sections).reduce((s, v) => s + v.max, 0);
    const percentage = Math.round((totalScore / maxScore) * 100);

    const grade = percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 65 ? 'B' : percentage >= 50 ? 'C' : 'D';

    res.json({
      success: true,
      score: {
        percentage,
        grade,
        sections,
        totalScore,
        maxScore,
        topTips: Object.values(sections)
          .flatMap(s => s.tips)
          .slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SKILL RADAR ──────────────────────────────────────────────────────────────

// @desc   Get skill radar data (aggregated from applications & profile)
// @route  GET /api/users/skill-radar
const getSkillRadar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get applications with job skills to find matches/gaps
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'skills experienceLevel')
      .limit(20);

    const userSkillSet = new Set((user.skills || []).map(s => s.toLowerCase()));

    // Aggregate required skills across applied jobs
    const requiredCounts = {};
    applications.forEach(app => {
      (app.job?.skills || []).forEach(skill => {
        const key = skill.toLowerCase();
        requiredCounts[key] = (requiredCounts[key] || 0) + 1;
      });
    });

    // Build radar categories
    const categories = [
      { subject: 'Technical Skills', required: 100, candidate: Math.min(100, (user.skills?.length || 0) * 8) },
      { subject: 'Profile Strength', required: 100, candidate: user.profileCompleteness || 0 },
      { subject: 'Experience', required: 100, candidate: Math.min(100, (user.experience?.length || 0) * 25) },
      { subject: 'Education', required: 100, candidate: Math.min(100, (user.education?.length || 0) * 40) },
      { subject: 'Online Presence', required: 100, candidate: Math.min(100, [user.linkedinUrl, user.githubUrl, user.portfolioUrl].filter(Boolean).length * 33) },
      { subject: 'Applications', required: 100, candidate: Math.min(100, applications.length * 10) },
    ];

    // Top missing skills from applied jobs
    const missingSkills = Object.entries(requiredCounts)
      .filter(([skill]) => !userSkillSet.has(skill))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, frequency: count }));

    // Matched skills
    const matchedSkills = Object.entries(requiredCounts)
      .filter(([skill]) => userSkillSet.has(skill))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, frequency: count }));

    res.json({
      success: true,
      radar: { categories, missingSkills, matchedSkills }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RECRUITER ANALYTICS ──────────────────────────────────────────────────────

// @desc   Get recruiter hiring analytics
// @route  GET /api/users/recruiter-analytics
const getRecruiterAnalytics = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    const [jobs, applications] = await Promise.all([
      Job.find({ recruiter: recruiterId }).select('title status applicationCount viewCount createdAt'),
      Application.find({ recruiter: recruiterId })
        .select('status createdAt updatedAt aiMatchScore job timeline')
        .populate('job', 'title')
        .limit(500)
    ]);

    const hasReachedStage = (app, stages) => {
      if (stages.includes(app.status)) return true;
      if (app.timeline && app.timeline.some(t => stages.includes(t.status))) return true;
      return false;
    };

    // Funnel stages
    const funnel = {
      applied:     applications.length,
      screening:   applications.filter(a => hasReachedStage(a, ['SCREENING', 'SHORTLISTED', 'INTERVIEW', 'TECHNICAL', 'OFFER', 'HIRED'])).length,
      interviewed: applications.filter(a => hasReachedStage(a, ['INTERVIEW', 'TECHNICAL', 'OFFER', 'HIRED'])).length,
      offered:     applications.filter(a => hasReachedStage(a, ['OFFER', 'HIRED'])).length,
      hired:       applications.filter(a => hasReachedStage(a, ['HIRED'])).length,
    };

    // Avg AI match score
    const scores = applications.map(a => a.aiMatchScore || 0).filter(s => s > 0);
    const avgMatchScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Applications over last 30 days
    const now = new Date();
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      return d;
    });

    const appsByDay = last30.map(day => {
      const key = day.toISOString().slice(0, 10);
      const count = applications.filter(a => {
        if (!a.createdAt) return false;
        try {
          const dateStr = typeof a.createdAt.toISOString === 'function' ? a.createdAt.toISOString() : new Date(a.createdAt).toISOString();
          return dateStr.slice(0, 10) === key;
        } catch (e) {
          return false;
        }
      }).length;
      return { date: key.slice(5), count };
    });

    // Job performance
    const jobPerformance = jobs.slice(0, 8).map(j => ({
      title: j.title,
      applications: j.applicationCount,
      views: j.viewCount,
      status: j.status,
      conversionRate: j.viewCount > 0 ? ((j.applicationCount / j.viewCount) * 100).toFixed(1) : '0'
    }));

    // Status breakdown for pie chart
    const statusBreakdown = Object.entries(
      applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})
    ).map(([status, count]) => ({ status, count }));

    res.json({
      success: true,
      analytics: {
        funnel,
        avgMatchScore,
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'ACTIVE').length,
        appsByDay,
        jobPerformance,
        statusBreakdown,
        totalViews: jobs.reduce((s, j) => s + j.viewCount, 0),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile, updateProfile, searchCandidates, getCandidateProfile,
  updateNotificationPreferences, parseResume, updatePushToken, getLeaderboard,
  saveJob, unsaveJob, getSavedJobs,
  getResumeScore, getSkillRadar, getRecruiterAnalytics
};
