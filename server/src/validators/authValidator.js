const { body } = require('express-validator');

const registerValidator = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('idCard').notEmpty().withMessage('Citizen ID (CCCD) is required')
    .isLength({ min: 9, max: 12 }).withMessage('ID Card must be 9-12 digits'),
  body('phone').optional().matches(/^[0-9]{10,11}$/).withMessage('Phone number must be 10-11 digits'),
  body('address').optional().isLength({ max: 255 }).withMessage('Address is too long')
];

const loginValidator = [
  body('username').notEmpty().withMessage('Username or Email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = {
  registerValidator,
  loginValidator
};
