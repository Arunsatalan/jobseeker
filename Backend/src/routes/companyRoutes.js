const express = require('express');
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompaniesByEmployer
} = require('../controllers/companyController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Public route for viewing companies (no auth required)
router
  .route('/')
  .get(getCompanies) // Public - anyone can view companies
  .post(protect, createCompany); // Protected - only authenticated users can create

// Public route for viewing individual companies (no auth required)
router
  .route('/:id')
  .get(getCompany);

// All other routes require authentication
router.use(protect);

router
  .route('/:id')
  .put(updateCompany)
  .delete(deleteCompany);

router
  .route('/employer/:employerId')
  .get(getCompaniesByEmployer);

module.exports = router;
