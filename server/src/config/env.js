const dotenv = require('dotenv');
const path = require('path');

// Load .env from the server root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
