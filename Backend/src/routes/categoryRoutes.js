const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');
const categoryController = require('../controllers/categoryController');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/names', categoryController.getCategoryNames);
router.get('/:id', categoryController.getCategoryById);

// Admin routes
router.post('/', protect, authorize('admin'), categoryController.createCategory);
router.put('/:id', protect, authorize('admin'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);

module.exports = router;