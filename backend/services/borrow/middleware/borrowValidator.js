const { body } = require('express-validator');

const borrowValidator = [
  body('readerId').isMongoId().withMessage('Valid readerId is required'),
  body('bookId').isMongoId().withMessage('Valid bookId is required'),
  body('durationDays').optional().isInt({ min: 1, max: 30 }).withMessage('Duration must be between 1 and 30 days')
];

const returnValidator = [
  body('borrowId').isMongoId().withMessage('Valid borrowId is required'),
  body('notes').optional().isString()
];

module.exports = {
  borrowValidator,
  returnValidator
};
