const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJob, updateJob, deleteJob, getMyJobs, getAIMatchedJobs, generateJobDescription, getRelatedJobs, getMarketIntelligence, analyzeGap } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/market-intelligence', getMarketIntelligence);
router.post('/generate-description', protect, authorize('RECRUITER', 'ADMIN'), generateJobDescription);
router.get('/ai-matches', protect, authorize('CANDIDATE'), getAIMatchedJobs);
router.get('/my-jobs', protect, authorize('RECRUITER', 'ADMIN'), getMyJobs);
router.post('/', protect, authorize('RECRUITER', 'ADMIN'), createJob);

router.get('/:id/related', getRelatedJobs);
router.post('/:id/analyze-gap', protect, authorize('CANDIDATE'), analyzeGap);
router.get('/:id', protect, getJob);
router.put('/:id', protect, authorize('RECRUITER', 'ADMIN'), updateJob);
router.delete('/:id', protect, authorize('RECRUITER', 'ADMIN'), deleteJob);

module.exports = router;
