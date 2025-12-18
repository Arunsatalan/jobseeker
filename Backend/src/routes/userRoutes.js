const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { validateUserUpdate, validateUserPreferences } = require('../validators/userValidators');
const userController = require('../controllers/userController');

// Protected routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, validate(validateUserUpdate), userController.updateProfile);
router.get('/:id', userController.getUserPublic);

// Preferences
router.put('/preferences', protect, validate(validateUserPreferences), userController.updatePreferences);
router.get('/preferences', protect, userController.getPreferences);

// Admin routes
router.get('/admin/list', protect, authorize('admin'), userController.getAllUsers);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
