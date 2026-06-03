const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateAgoraToken,
  executeCode,
  analyzeInterview,
  generateQuestion,
  generateChallenge,
  createInterviewSession,
  getInterviewSession,
  updateSessionStatus,
  submitScorecard,
  saveCodeSnapshot,
  generateAIReport,
  getMyInterviews,
  addChatMessage
} = require('../controllers/interviewController');

// Public / token routes
router.post('/token', protect, generateAgoraToken);

// Code execution (free Piston API — no API key needed)
router.post('/execute-code', protect, executeCode);

// AI features
router.post('/analyze', protect, analyzeInterview);
router.post('/generate-question', protect, generateQuestion);
router.post('/generate-challenge', protect, generateChallenge);

// Session management
router.post('/sessions', protect, createInterviewSession);
router.get('/sessions/my', protect, getMyInterviews);
router.get('/sessions/:id', protect, getInterviewSession);
router.patch('/sessions/:id/status', protect, updateSessionStatus);
router.post('/sessions/:id/scorecard', protect, submitScorecard);
router.post('/sessions/:id/snapshot', protect, saveCodeSnapshot);
router.post('/sessions/:id/report', protect, generateAIReport);
router.post('/sessions/:id/chat', protect, addChatMessage);

module.exports = router;
