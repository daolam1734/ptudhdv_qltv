const { body } = require('express-validator');

const createStaffValidator = [
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('idCard').notEmpty().withMessage('Citizen ID (CCCD) is required')
    .isLength({ min: 9, max: 12 }).withMessage('ID Card must be 9-12 digits'),
  body('role').optional().isIn(['admin', 'librarian']).withMessage('Invalid role'),
  body('phone').optional().matches(/^[0-9]{10,11}$/).withMessage('Valid phone number is required')
];

const updateStaffValidator = [
  body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().matches(/^[0-9]{10,11}$/).withMessage('Valid phone number is required'),
  body('idCard').optional().isLength({ min: 9, max: 12 }).withMessage('ID Card must be 9-12 digits'),
  body('role').optional().isIn(['admin', 'librarian']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
];

module.exports = {
  createStaffValidator,
  updateStaffValidator
};
