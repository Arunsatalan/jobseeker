
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('employer'));

router.get('/status', billingController.getBillingStatus);
router.post('/add-credits', billingController.addCredits);
router.post('/upgrade', billingController.upgradePlan);

module.exports = router;
