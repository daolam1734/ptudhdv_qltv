const { body } = require('express-validator');

const categoryValidator = [
  body('name').notEmpty().withMessage('Category name is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 })
];

module.exports = {
  categoryValidator
};
