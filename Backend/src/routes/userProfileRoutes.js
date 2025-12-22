const express = require('express');
const {
  getUserProfile,
  getMyProfile,
  createOrUpdateProfile,
  updateEmployerProfile,
  getEmployerCompanyData,
  deleteUserProfile,
} = require('../controllers/userProfileController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Get current user's profile
router.get('/me', getMyProfile);

// Get employer company data
router.get('/employer/company-data', authorize('employer'), getEmployerCompanyData);

// Create or update profile
router.post('/', createOrUpdateProfile);

// Update employer profile
router.put('/employer/details', authorize('employer'), updateEmployerProfile);

// Get specific user profile
router.get('/:userId', getUserProfile);

// Delete profile
router.delete('/:userId', deleteUserProfile);

module.exports = router;
