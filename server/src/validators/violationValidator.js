const { body, param } = require('express-validator');

const payViolationValidator = [
  param('violationId').isMongoId().withMessage('Invalid Violation ID format')
];

const createViolationValidator = [
  body('readerId').isMongoId().withMessage('Valid Reader ID is required'),
  body('borrowId').isMongoId().withMessage('Valid Borrow ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('type').optional().isIn(['overdue', 'damaged', 'lost']).withMessage('Invalid violation type')
];

module.exports = {
  payViolationValidator,
  createViolationValidator
};
