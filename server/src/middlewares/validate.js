const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/ApiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param || err.path]: err.msg }));

  return ApiResponse.error(res, 'Validation error', 400, extractedErrors);
};

module.exports = validate;
