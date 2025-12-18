const Joi = require('joi');

const validateUserRegistration = Joi.object({
  firstName: Joi.string().trim().required().messages({
    'string.empty': 'First name is required',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().trim().required().messages({
    'string.empty': 'Last name is required',
    'any.required': 'Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character',
      'any.required': 'Password is required'
    }),
  role: Joi.string().valid('jobseeker', 'employer').required().messages({
    'any.only': 'Invalid role',
    'any.required': 'Role is required'
  })
});

const validateUserLogin = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const validateUserUpdate = Joi.object({
  firstName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional(),
  phone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).optional().messages({
    'string.pattern.base': 'Invalid phone number'
  }),
  location: Joi.string().trim().optional()
});

const validateUserPreferences = Joi.object({
  jobTitle: Joi.string().trim().optional(),
  industries: Joi.array().items(Joi.string()).optional(),
  experience: Joi.string().valid('entry', 'mid', 'senior', 'executive').optional(),
  employmentType: Joi.array().items(Joi.string()).optional()
});

const validatePasswordReset = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  })
});

const validatePasswordChange = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character',
      'any.required': 'New password is required'
    })
});

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateUserPreferences,
  validatePasswordReset,
  validatePasswordChange,
};
