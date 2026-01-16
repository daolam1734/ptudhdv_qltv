const { body } = require('express-validator');

const borrowValidator = [
  body('readerId').optional().isMongoId().withMessage('ID độc giả không hợp lệ'),
  body('bookId').optional().isMongoId().withMessage('ID sách không hợp lệ'),
  body('bookIds').optional().isArray().withMessage('Danh sách sách phải là một mảng'),
  body('bookIds.*').optional().isMongoId().withMessage('ID sách trong danh sách không hợp lệ'),
  body('durationDays').optional().isInt({ min: 1, max: 30 }).withMessage('Thời gian mượn phải từ 1 đến 30 ngày')
];

const returnValidator = [
  body('notes').optional().isString(),
  body('condition').optional().isIn(['good', 'damaged', 'lost']).withMessage('Invalid book condition')
];

const renewValidator = [
  body('extraDays').optional().isInt({ min: 1, max: 14 }).withMessage('Extension days must be between 1 and 14')
];

module.exports = {
  borrowValidator,
  returnValidator,
  renewValidator
};
