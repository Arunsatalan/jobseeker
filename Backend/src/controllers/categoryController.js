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

// @desc Get subcategories for a category
// @route GET /api/v1/categories/:id/subcategories
// @access Public
exports.getCategorySubcategories = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category || !category.isActive) {
    return sendError(res, 404, 'Category not found');
  }

  const activeSubcategories = category.subcategories.filter(sub => sub.isActive);

  return sendSuccess(res, 200, 'Subcategories retrieved successfully', activeSubcategories);
});

// @desc Add subcategory to category
// @route POST /api/v1/categories/:id/subcategories
// @access Private/Admin
exports.addSubcategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category || !category.isActive) {
    return sendError(res, 404, 'Category not found');
  }

  // Check if subcategory already exists in this category
  const existingSubcategory = category.subcategories.find(
    sub => sub.name.toLowerCase() === name.toLowerCase() && sub.isActive
  );

  if (existingSubcategory) {
    return sendError(res, 400, 'Subcategory with this name already exists in this category');
  }

  const newSubcategory = {
    name: name.trim(),
    description: description ? description.trim() : '',
    isActive: true,
    createdAt: new Date(),
  };

  category.subcategories.push(newSubcategory);
  await category.save();

  logger.info(`Subcategory added to category ${category._id}: ${newSubcategory.name}`);

  return sendSuccess(res, 201, 'Subcategory added successfully', newSubcategory);
});

// @desc Update subcategory in category
// @route PUT /api/v1/categories/:id/subcategories/:subId
// @access Private/Admin
exports.updateSubcategory = asyncHandler(async (req, res, next) => {
  const { name, description, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category || !category.isActive) {
    return sendError(res, 404, 'Category not found');
  }

  const subcategoryIndex = category.subcategories.findIndex(
    sub => sub._id.toString() === req.params.subId
  );

  if (subcategoryIndex === -1) {
    return sendError(res, 404, 'Subcategory not found');
  }

  // Check if name is being changed and if it conflicts
  if (name && name !== category.subcategories[subcategoryIndex].name) {
    const existingSubcategory = category.subcategories.find(
      sub => sub.name.toLowerCase() === name.toLowerCase() && sub._id.toString() !== req.params.subId && sub.isActive
    );
    if (existingSubcategory) {
      return sendError(res, 400, 'Subcategory with this name already exists in this category');
    }
  }

  // Update subcategory
  if (name !== undefined) category.subcategories[subcategoryIndex].name = name.trim();
  if (description !== undefined) category.subcategories[subcategoryIndex].description = description.trim();
  if (isActive !== undefined) category.subcategories[subcategoryIndex].isActive = isActive;

  await category.save();

  logger.info(`Subcategory updated in category ${category._id}: ${category.subcategories[subcategoryIndex].name}`);

  return sendSuccess(res, 200, 'Subcategory updated successfully', category.subcategories[subcategoryIndex]);
});

// @desc Delete subcategory from category
// @route DELETE /api/v1/categories/:id/subcategories/:subId
// @access Private/Admin
exports.deleteSubcategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category || !category.isActive) {
    return sendError(res, 404, 'Category not found');
  }

  const subcategoryIndex = category.subcategories.findIndex(
    sub => sub._id.toString() === req.params.subId
  );

  if (subcategoryIndex === -1) {
    return sendError(res, 404, 'Subcategory not found');
  }

  const subcategoryName = category.subcategories[subcategoryIndex].name;

  // Remove subcategory from array
  category.subcategories.splice(subcategoryIndex, 1);
  await category.save();

  logger.info(`Subcategory deleted from category ${category._id}: ${subcategoryName}`);

  return sendSuccess(res, 200, 'Subcategory deleted successfully');
});

module.exports = exports;