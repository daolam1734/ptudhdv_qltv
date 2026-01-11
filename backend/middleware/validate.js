// Validation middleware examples

// Validate ObjectId
exports.validateObjectId = (req, res, next) => {
  const mongoose = require('mongoose');
  
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

// Validate required fields
exports.validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        fields: missingFields
      });
    }
    
    next();
  };
};

// Validate email format
exports.validateEmail = (req, res, next) => {
  const email = req.body.email;
  
  if (email) {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
  }
  
  next();
};
