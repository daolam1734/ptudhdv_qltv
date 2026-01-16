const { body } = require('express-validator');

const registerValidator = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').notEmpty().withMessage('Full name is required')
];

const loginValidator = [
  body('username').notEmpty().withMessage('Username or Email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
  registerValidator,
  loginValidator
};
