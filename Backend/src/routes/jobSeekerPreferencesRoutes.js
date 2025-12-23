const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const jobSeekerPreferencesController = require('../controllers/jobSeekerPreferencesController');

// Get preferences
router.get('/preferences', protect, jobSeekerPreferencesController.getPreferences);

// Create/Update preferences
router.post('/preferences', protect, jobSeekerPreferencesController.savePreferences);

// Update specific preferences
router.put('/preferences', protect, jobSeekerPreferencesController.updatePreferences);

// Delete all preferences
router.delete('/preferences', protect, jobSeekerPreferencesController.deletePreferences);

module.exports = router;
