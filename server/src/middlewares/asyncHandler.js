const ApiResponse = require('../utils/ApiResponse');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Error:', error);

    // Custom status code from error object
    const statusCode = error.status || 500;
    const message = error.message || 'Internal Server Error';

    // Validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return ApiResponse.error(res, 'Validation Error', 400, messages);
    }

    // Duplicate key error
    if (error.code === 11000) {
      return ApiResponse.error(res, 'Duplicate entry', 400);
    }

    // Cast error (invalid ObjectId)
    if (error.name === 'CastError') {
      return ApiResponse.error(res, 'Invalid ID format', 400);
    }

    // Custom application errors
    if (error.message === 'Entity not found') {
      return ApiResponse.error(res, error.message, 404);
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.error(res, 'Invalid token', 401);
    }

    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired', 401);
    }

    // Generic error
    return ApiResponse.error(
      res,
      error.message || 'Internal Server Error',
      error.status || error.statusCode || 500
    );
  });
};

module.exports = asyncHandler;
