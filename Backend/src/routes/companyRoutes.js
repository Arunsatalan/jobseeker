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

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getCompanies)
  .post(createCompany);

router
  .route('/:id')
  .get(getCompany)
  .put(updateCompany)
  .delete(deleteCompany);

router
  .route('/employer/:employerId')
  .get(getCompaniesByEmployer);

module.exports = router;
