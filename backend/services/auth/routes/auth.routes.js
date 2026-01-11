const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../../shared/middleware/authMiddleware');
const validate = require('../../../shared/middleware/validate');
const { registerValidator, loginValidator } = require('../middleware/authValidator');

module.exports = (authController) => {
  // Public routes
  router.post('/register', registerValidator, validate, authController.register);  // Register reader
  router.post('/login', loginValidator, validate, authController.login);        // Login (staff/reader)

  // Protected routes - All authenticated users
  router.get('/me', authMiddleware, authController.getMe);
  router.put('/profile', authMiddleware, authController.updateProfile);
  router.post('/change-password', authMiddleware, authController.changePassword);

  // Admin only routes
  router.post('/staff/register', authMiddleware, authorize('admin'), authController.registerStaff);
  router.get('/staff', authMiddleware, authorize('admin', 'librarian'), authController.getAllStaff);

  // Staff and Admin routes
  router.get('/readers', authMiddleware, authorize('admin', 'librarian', 'staff'), authController.getAllReaders);

  return router;
};
