const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { validateJobCreation, validateJobUpdate, validateJobSearch } = require('../validators/jobValidators');
const jobController = require('../controllers/jobController');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/search', validate(validateJobSearch), jobController.searchJobs);
router.get('/:id', jobController.getJobById);

// Employer routes
router.post('/', protect, authorize('employer'), validate(validateJobCreation), jobController.createJob);
router.put('/:id', protect, authorize('employer'), validate(validateJobUpdate), jobController.updateJob);
router.delete('/:id', protect, authorize('employer'), jobController.deleteJob);
router.get('/employer/jobs', protect, authorize('employer'), jobController.getEmployerJobs);

// Admin routes
router.delete('/admin/:id', protect, authorize('admin'), jobController.deleteJob);

module.exports = router;
