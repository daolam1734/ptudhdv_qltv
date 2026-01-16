const mongoose = require('mongoose');
const env = require('./env');

const connectDatabase = async (uri = env.MONGODB_URI) => {
  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'library_db' // Unified database name
    });

    console.log(`✅ Database connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database connection failed:`, error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
