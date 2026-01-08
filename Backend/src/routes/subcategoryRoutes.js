const express = require('express');
const {
  getAllSubcategories,
  getSubcategoryById,
  getSubcategoriesByCategory,
  getSubcategoryNames,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require('../controllers/subcategoryController');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllSubcategories);
router.get('/names', getSubcategoryNames);
router.get('/category/:categoryId', getSubcategoriesByCategory);
router.get('/:id', getSubcategoryById);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createSubcategory);
router.put('/:id', protect, authorize('admin'), updateSubcategory);
router.delete('/:id', protect, authorize('admin'), deleteSubcategory);

module.exports = router;