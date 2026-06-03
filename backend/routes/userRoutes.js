const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, searchCandidates, getCandidateProfile,
  updateNotificationPreferences, parseResume, updatePushToken, getLeaderboard,
  saveJob, unsaveJob, getSavedJobs,
  getResumeScore, getSkillRadar, getRecruiterAnalytics
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Profile
router.get('/profile', protect, getProfile);
router.get('/leaderboard', protect, getLeaderboard);
router.put('/profile', protect, updateProfile);
router.get('/candidates', protect, authorize('RECRUITER', 'ADMIN'), searchCandidates);
router.get('/candidates/:id', getCandidateProfile);
router.put('/notification-preferences', protect, updateNotificationPreferences);
router.put('/push-token', protect, updatePushToken);
router.post('/parse-resume', protect, upload.single('resume'), parseResume);

// ── Bookmarks ──────────────────────────────────────────────────────────────────
router.get('/saved-jobs',         protect, getSavedJobs);
router.post('/saved-jobs/:jobId', protect, saveJob);
router.delete('/saved-jobs/:jobId', protect, unsaveJob);

// ── AI Resume Score ────────────────────────────────────────────────────────────
router.get('/resume-score', protect, getResumeScore);

// ── Skill Radar ────────────────────────────────────────────────────────────────
router.get('/skill-radar', protect, getSkillRadar);

// ── Recruiter Analytics ────────────────────────────────────────────────────────
router.get('/recruiter-analytics', protect, authorize('RECRUITER', 'ADMIN'), getRecruiterAnalytics);

module.exports = router;
