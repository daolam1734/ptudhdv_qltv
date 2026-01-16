const { body } = require('express-validator');

const bookValidator = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('isbn').matches(/^(?:\d{10}|\d{13})$/).withMessage('Valid ISBN (10 or 13 digits) is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('publisher').notEmpty().withMessage('Publisher is required'),
  body('publishYear').isInt({ min: 1800, max: new Date().getFullYear() + 1 }).withMessage('Valid publish year is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('lang').notEmpty().withMessage('Language is required'),
  body('pages').isInt({ min: 1 }).withMessage('Number of pages is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description too long'),
  body('status').optional().isIn(['available', 'unavailable', 'maintenance', 'discontinued']).withMessage('Invalid status')
];

module.exports = {
  bookValidator
};
