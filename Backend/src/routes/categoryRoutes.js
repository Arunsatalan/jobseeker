const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');
const categoryController = require('../controllers/categoryController');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/subcategories', categoryController.getCategorySubcategories);

// Admin routes
router.post('/', protect, authorize('admin'), categoryController.createCategory);
router.post('/:id/subcategories', protect, authorize('admin'), categoryController.addSubcategory);
router.put('/:id', protect, authorize('admin'), categoryController.updateCategory);
router.put('/:id/subcategories/:subId', protect, authorize('admin'), categoryController.updateSubcategory);
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);
router.delete('/:id/subcategories/:subId', protect, authorize('admin'), categoryController.deleteSubcategory);

module.exports = router;