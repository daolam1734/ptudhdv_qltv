const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { registerValidator, loginValidator } = require('../validators/authValidator');

module.exports = (authController) => {
  router.post('/register', registerValidator, validate, authController.register);
  router.post('/login', loginValidator, validate, authController.login);
  router.get('/me', authMiddleware, authController.getMe);
  router.put('/profile', authMiddleware, authController.updateProfile);
  router.post('/change-password', authMiddleware, authController.changePassword);
  return router;
};
