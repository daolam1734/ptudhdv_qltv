const express = require('express');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { payViolationValidator } = require('../validators/violationValidator');

const router = express.Router();

module.exports = (violationController) => {
  // All violation routes require authentication
  router.use(protect);

  // Readers can view their own violations
  router.get('/my-violations', violationController.getReaderViolations);

  // Staff and Admin routes
  router.use(restrictTo('librarian', 'admin'));
  
  router.get('/', violationController.getAllViolations);
  router.get('/reader/:readerId', violationController.getReaderViolations);
  router.post('/:violationId/pay', payViolationValidator, validate, violationController.payViolation);
  router.post('/', restrictTo('librarian', 'admin'), violationController.createViolation);

  return router;
};
