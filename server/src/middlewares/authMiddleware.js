const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/ApiResponse');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return ApiResponse.error(res, 'Access denied. No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Not authenticated', 401);
    }

    const userRole = req.user.role?.toLowerCase();
    const authorizedRoles = roles.map(r => r.toLowerCase());

    if (!authorizedRoles.includes(userRole)) {
      return ApiResponse.error(res, 'Access denied. Insufficient permissions', 403);
    }

    next();
  };
};

module.exports = { 
  authMiddleware, 
  authorize,
  protect: authMiddleware,
  restrictTo: authorize
};
