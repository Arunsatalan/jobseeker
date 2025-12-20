const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/async');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

// @desc Get all subcategories
// @route GET /api/v1/subcategories
// @access Public
exports.getAllSubcategories = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50, category } = req.query;

  let query = { isActive: true };

  if (category) {
    query.category = category;
  }

  const pagination = helpers.getPaginationData(page, limit, await Subcategory.countDocuments(query));

  const subcategories = await Subcategory.find(query)
    .populate('category', 'name')
    .limit(pagination.limit)
    .skip(pagination.startIndex)
    .sort({ name: 1 });

  return sendPaginated(res, 200, 'Subcategories retrieved successfully', subcategories, pagination);
});

// @desc Get subcategory by ID
// @route GET /api/v1/subcategories/:id
// @access Public
exports.getSubcategoryById = asyncHandler(async (req, res, next) => {
  const subcategory = await Subcategory.findById(req.params.id)
    .populate('category', 'name');

  if (!subcategory || !subcategory.isActive) {
    return sendError(res, 404, 'Subcategory not found');
  }

  return sendSuccess(res, 200, 'Subcategory retrieved successfully', subcategory);
});

// @desc Get subcategories by category
// @route GET /api/v1/subcategories/category/:categoryId
// @access Public
exports.getSubcategoriesByCategory = asyncHandler(async (req, res, next) => {
  const subcategories = await Subcategory.find({
    category: req.params.categoryId,
    isActive: true
  })
    .populate('category', 'name')
    .sort({ name: 1 });

  return sendSuccess(res, 200, 'Subcategories retrieved successfully', subcategories);
});

// @desc Get subcategory names only (for dropdowns)
// @route GET /api/v1/subcategories/names
// @access Public
exports.getSubcategoryNames = asyncHandler(async (req, res, next) => {
  const { category } = req.query;

  let query = { isActive: true };
  if (category) {
    query.category = category;
  }

  const subcategories = await Subcategory.find(query, 'name')
    .sort({ name: 1 });

  const subcategoryNames = subcategories.map(sub => sub.name);

  return sendSuccess(res, 200, 'Subcategory names retrieved successfully', subcategoryNames);
});

// @desc Create subcategory
// @route POST /api/v1/subcategories
// @access Private/Admin
exports.createSubcategory = asyncHandler(async (req, res, next) => {
  const { name, description, categoryId } = req.body;

  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category || !category.isActive) {
    return sendError(res, 404, 'Category not found');
  }

  // Check if subcategory already exists in this category
  const existingSubcategory = await Subcategory.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    category: categoryId
  });
  if (existingSubcategory) {
    return sendError(res, 400, 'Subcategory with this name already exists in this category');
  }

  const subcategory = await Subcategory.create({
    name,
    description,
    category: categoryId,
    createdBy: req.user._id,
  });

  logger.info(`Subcategory created: ${subcategory._id} - ${subcategory.name}`);

  return sendSuccess(res, 201, 'Subcategory created successfully', subcategory);
});

// @desc Update subcategory
// @route PUT /api/v1/subcategories/:id
// @access Private/Admin
exports.updateSubcategory = asyncHandler(async (req, res, next) => {
  const { name, description, isActive } = req.body;

  let subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    return sendError(res, 404, 'Subcategory not found');
  }

  // Check if name is being changed and if it conflicts
  if (name && name !== subcategory.name) {
    const existingSubcategory = await Subcategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category: subcategory.category,
      _id: { $ne: req.params.id }
    });
    if (existingSubcategory) {
      return sendError(res, 400, 'Subcategory with this name already exists in this category');
    }
  }

  subcategory = await Subcategory.findByIdAndUpdate(
    req.params.id,
    { name, description, isActive },
    { new: true, runValidators: true }
  ).populate('category', 'name');

  logger.info(`Subcategory updated: ${subcategory._id} - ${subcategory.name}`);

  return sendSuccess(res, 200, 'Subcategory updated successfully', subcategory);
});

// @desc Delete subcategory
// @route DELETE /api/v1/subcategories/:id
// @access Private/Admin
exports.deleteSubcategory = asyncHandler(async (req, res, next) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (!subcategory) {
    return sendError(res, 404, 'Subcategory not found');
  }

  // Hard delete - completely remove from database
  await Subcategory.findByIdAndDelete(req.params.id);

  logger.info(`Subcategory hard deleted: ${req.params.id} - ${subcategory.name}`);

  return sendSuccess(res, 200, 'Subcategory deleted successfully');
});