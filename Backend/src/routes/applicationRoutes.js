const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

// Smart Apply route MUST come before generic /:jobId route
router.post('/smart-apply/:jobId', protect, authorize('jobseeker'), applicationController.smartApplyForJob);

// Protected routes
router.post('/:jobId', protect, authorize('jobseeker'), applicationController.applyForJob);
router.get('/', protect, applicationController.getApplications);
router.get('/:id', protect, applicationController.getApplicationById);
router.put('/:id/status', protect, applicationController.updateApplicationStatus);

// Employer routes
router.get('/employer/applications', protect, authorize('employer'), applicationController.getEmployerApplications);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), applicationController.getAllApplications);

module.exports = router;
