const Category = require('../models/Category');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

// @desc Get all categories
// @route GET /api/v1/categories
// @access Public
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50 } = req.query;

  const pagination = helpers.getPaginationData(page, limit, await Category.countDocuments({ isActive: true }));

  const categories = await Category.find({ isActive: true })
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ name: 1 });

  return sendPaginated(res, 200, 'Categories retrieved successfully', categories, pagination);
});

// @desc Get category by ID
// @route GET /api/v1/categories/:id
// @access Public
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category || !category.isActive) {
    return sendError(res, 404, 'Category not found');
  }

  return sendSuccess(res, 200, 'Category retrieved successfully', category);
});

// @desc Create category
// @route POST /api/v1/categories
// @access Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  // Check if category already exists
  const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingCategory) {
    return sendError(res, 400, 'Category with this name already exists');
  }

  const category = await Category.create({
    name,
    description,
    createdBy: req.user._id,
  });

  logger.info(`Category created: ${category._id} - ${category.name}`);

  return sendSuccess(res, 201, 'Category created successfully', category);
});

// @desc Update category
// @route PUT /api/v1/categories/:id
// @access Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description, isActive } = req.body;

  let category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  // Check if name is being changed and if it conflicts
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    if (existingCategory) {
      return sendError(res, 400, 'Category with this name already exists');
    }
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    { name, description, isActive },
    { new: true, runValidators: true }
  );

  logger.info(`Category updated: ${category._id} - ${category.name}`);

  return sendSuccess(res, 200, 'Category updated successfully', category);
});

// @desc Delete category
// @route DELETE /api/v1/categories/:id
// @access Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  // Hard delete - completely remove from database
  await Category.findByIdAndDelete(req.params.id);

  logger.info(`Category hard deleted: ${req.params.id} - ${category.name}`);

  return sendSuccess(res, 200, 'Category deleted successfully');
});

// @desc Get category names only (for dropdowns)
// @route GET /api/v1/categories/names
// @access Public
exports.getCategoryNames = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }, 'name')
    .sort({ name: 1 });

  const categoryNames = categories.map(cat => cat.name);

  return sendSuccess(res, 200, 'Category names retrieved successfully', categoryNames);
});