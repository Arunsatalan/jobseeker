const Company = require('../models/Company');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// @desc    Get all companies
// @route   GET /api/v1/companies
// @access  Private/Admin
exports.getCompanies = asyncHandler(async (req, res, next) => {
  const companies = await Company.find().populate('employees', 'name email').populate('jobs', 'title status');

  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies
  });
});

// @desc    Get single company
// @route   GET /api/v1/companies/:id
// @access  Private/Admin
exports.getCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id)
    .populate('employees', 'name email')
    .populate('jobs', 'title status createdAt');

  if (!company) {
    return next(new ErrorResponse(`Company not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Create new company
// @route   POST /api/v1/companies
// @access  Private/Admin
exports.createCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.create(req.body);

  res.status(201).json({
    success: true,
    data: company
  });
});

// @desc    Update company
// @route   PUT /api/v1/companies/:id
// @access  Private/Admin
exports.updateCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!company) {
    return next(new ErrorResponse(`Company not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Delete company
// @route   DELETE /api/v1/companies/:id
// @access  Private/Admin
exports.deleteCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return next(new ErrorResponse(`Company not found with id ${req.params.id}`, 404));
  }

  await company.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get companies by employer
// @route   GET /api/v1/companies/employer/:employerId
// @access  Private/Admin
exports.getCompaniesByEmployer = asyncHandler(async (req, res, next) => {
  const companies = await Company.find({ employees: req.params.employerId })
    .populate('employees', 'name email')
    .populate('jobs', 'title status createdAt');

  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies
  });
});
