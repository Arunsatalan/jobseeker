const Joi = require('joi');

const validateJobCreation = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Job title is required',
    'any.required': 'Job title is required'
  }),
  description: Joi.string().trim().required().messages({
    'string.empty': 'Job description is required',
    'any.required': 'Job description is required'
  }),
  company: Joi.string().trim().required().messages({
    'string.empty': 'Company name is required',
    'any.required': 'Company name is required'
  }),
  location: Joi.string().trim().required().messages({
    'string.empty': 'Location is required',
    'any.required': 'Location is required'
  }),
  employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary', 'internship').required().messages({
    'any.only': 'Invalid employment type',
    'any.required': 'Employment type is required'
  }),
  salaryMin: Joi.number().optional().allow(null, '').messages({
    'number.base': 'Minimum salary must be a number'
  }),
  salaryMax: Joi.number().optional().allow(null, '').messages({
    'number.base': 'Maximum salary must be a number'
  }),
  salaryPeriod: Joi.string().valid('hourly', 'monthly', 'yearly').optional(),
  experience: Joi.string().valid('entry', 'mid', 'senior', 'executive').required().messages({
    'any.only': 'Invalid experience level',
    'any.required': 'Experience level is required'
  }),
  skills: Joi.array().items(Joi.string()).optional(),
  industry: Joi.string().trim().required().messages({
    'string.empty': 'Industry is required',
    'any.required': 'Industry is required'
  }),
  category: Joi.string().trim().required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required'
  }),
  requirements: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  remote: Joi.boolean().optional(),
  expiresAt: Joi.date().allow(null, '').optional(),
  status: Joi.string().optional(),
  customSections: Joi.array().items(Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required()
  }).unknown(true)).optional()
}).unknown(true);

const validateJobUpdate = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  company: Joi.string().trim().optional(),
  location: Joi.string().trim().optional(),
  employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'temporary', 'internship').optional(),
  salaryMin: Joi.number().optional().allow(null, ''),
  salaryMax: Joi.number().optional().allow(null, ''),
  salaryPeriod: Joi.string().valid('hourly', 'monthly', 'yearly').optional(),
  experience: Joi.string().valid('entry', 'mid', 'senior', 'executive').optional(),
  category: Joi.string().trim().optional(),
  industry: Joi.string().trim().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  requirements: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  remote: Joi.boolean().optional(),
  expiresAt: Joi.date().allow(null, '').optional(),
  status: Joi.string().optional(),
  customSections: Joi.array().items(Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required()
  }).unknown(true)).optional()
}).unknown(true);

const validateJobSearch = Joi.object({
  keyword: Joi.string().trim().optional(),
  location: Joi.string().trim().optional(),
  employmentType: Joi.array().items(Joi.string()).optional(),
  experience: Joi.array().items(Joi.string()).optional(),
  salaryMin: Joi.number().optional(),
  salaryMax: Joi.number().optional(),
  page: Joi.number().integer().optional(),
  limit: Joi.number().integer().optional()
});

module.exports = {
  validateJobCreation,
  validateJobUpdate,
  validateJobSearch,
};
