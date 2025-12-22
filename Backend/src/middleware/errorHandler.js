const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error with full details
  console.error('=== ERROR HANDLER ===');
  console.error('Error object:', err);
  console.error('Error type:', typeof err);
  console.error('Is Error instance:', err instanceof Error);
  
  const errorDetails = {
    message: err?.message || 'Unknown error',
    code: err?.code,
    status: err?.statusCode || 500,
    name: err?.name,
    toString: err?.toString?.(),
  };
  
  console.error('ERROR DETAILS:', JSON.stringify(errorDetails, null, 2));
  logger.error(JSON.stringify(errorDetails, null, 2));

  const statusCode = err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: err?.message,
      type: err?.name,
    }),
  });
};

module.exports = errorHandler;
