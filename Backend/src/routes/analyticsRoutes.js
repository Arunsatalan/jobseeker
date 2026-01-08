
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require employer role
router.use(protect);
router.use(authorize('employer'));

router.get('/dashboard', analyticsController.getDashboardAnalytics);
router.get('/jobs', analyticsController.getJobPerformance);
router.get('/candidates', analyticsController.getCandidateInsights);

module.exports = router;
