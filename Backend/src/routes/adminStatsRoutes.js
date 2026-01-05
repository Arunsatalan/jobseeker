const express = require('express');
const {
    getOverviewStats,
    getRevenueStats,
    getUserGrowthStats,
    getGeographyStats,
    getRecentActivities
} = require('../controllers/adminStatsController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getOverviewStats);
router.get('/revenue', getRevenueStats);
router.get('/user-growth', getUserGrowthStats);
router.get('/geography', getGeographyStats);
router.get('/activities/recent', getRecentActivities);

module.exports = router;
