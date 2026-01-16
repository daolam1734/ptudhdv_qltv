const dotenv = require('dotenv');
const createApp = require('./app');
const connectDatabase = require('./config/db');

// Load environment variables
dotenv.config();

const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase();

    const app = await createApp();
    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
