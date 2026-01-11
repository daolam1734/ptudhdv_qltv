const mongoose = require('mongoose');

const connectDatabase = async (uri, dbName) => {
  try {
    const conn = await mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName
    });

    console.log(`✅ Database connected: ${dbName}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database connection failed: ${dbName}`, error.message);
    throw error;
  }
};

module.exports = connectDatabase;
