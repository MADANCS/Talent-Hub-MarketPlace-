const express = require('express');
const router = express.Router();
const {
  applyForJob, getMyApplications, getJobApplications, getApplicationById,
  updateApplicationStatus, withdrawApplication, getRecruiterApplications,
  generateInterviewQuestions, generateCoverLetter, updateApplicationNotes, scheduleInterview,
  updateInterviewFeedback, generateAIVerdict, updateInterviewCandidateFeedback
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my-applications', protect, authorize('CANDIDATE'), getMyApplications);
router.get('/recruiter', protect, authorize('RECRUITER', 'ADMIN'), getRecruiterApplications);
router.get('/job/:jobId', protect, authorize('RECRUITER', 'ADMIN'), getJobApplications);
router.get('/:id', protect, getApplicationById);

router.post('/', protect, authorize('CANDIDATE'), applyForJob);
router.post('/generate-cover-letter', protect, authorize('CANDIDATE'), generateCoverLetter);
router.put('/:id/status', protect, authorize('RECRUITER', 'ADMIN'), updateApplicationStatus);
router.patch('/:id/notes', protect, authorize('RECRUITER', 'ADMIN'), updateApplicationNotes);
router.post('/:id/interviews', protect, authorize('RECRUITER', 'ADMIN'), scheduleInterview);
router.put('/:id/interviews/:interviewId', protect, authorize('RECRUITER', 'ADMIN'), updateInterviewFeedback);
router.put('/:id/interviews/:interviewId/candidate-feedback', protect, authorize('CANDIDATE'), updateInterviewCandidateFeedback);
router.post('/:id/ai-verdict', protect, authorize('RECRUITER', 'ADMIN'), generateAIVerdict);
router.post('/:id/generate-questions', protect, authorize('RECRUITER', 'ADMIN'), generateInterviewQuestions);
router.put('/:id/withdraw', protect, authorize('CANDIDATE'), withdrawApplication);

module.exports = router;
