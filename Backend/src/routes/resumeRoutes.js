const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const resumeController = require('../controllers/resumeController');

// Protected routes
router.post('/upload', protect, authorize('jobseeker'), upload.single('resume'), resumeController.uploadResume);
router.get('/', protect, resumeController.getResumes);
router.get('/:id', protect, resumeController.getResumeById);
router.put('/:id', protect, resumeController.updateResume);
router.delete('/:id', protect, resumeController.deleteResume);
router.post('/:id/set-default', protect, resumeController.setDefaultResume);

module.exports = router;
