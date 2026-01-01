const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// All routes require authentication
router.use(protect);

// AI analysis routes
router.post('/analyze-profile', aiController.analyzeProfile);
router.post('/optimize-resume', aiController.optimizeResume);
router.post('/generate-cover-letter', aiController.generateCoverLetter);
router.post('/smart-apply', aiController.smartApply);
// AI Interview Coach routes
router.post('/start-interview', aiController.startInterview);
router.post('/ask-question', aiController.askQuestion);
router.post('/submit-answer', aiController.submitAnswer);
// Support Message
router.post('/generate-support-message', aiController.generateSupportMessage);

module.exports = router;
