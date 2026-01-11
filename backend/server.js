const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { swaggerUi, specs } = require('./config/swagger');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Services Initializer
const initAuthService = require('./services/auth');
const initBookService = require('./services/book');
const initReaderService = require('./services/reader');
const initBorrowService = require('./services/borrow');
const initStaffService = require('./services/staff');
const initReportService = require('./services/reports');

async function startServer() {
  try {
    // Middleware
    app.use(helmet());
    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests'
    });
    app.use('/api/', limiter);

    // API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    // Initialize Services
    console.log('Initializing services...');
    const authService = await initAuthService();
    const bookService = await initBookService();
    const readerService = await initReaderService();
    const staffService = await initStaffService();
    const reportService = await initReportService();
    const borrowService = await initBorrowService(bookService.service, readerService.service);

    // Inject borrowService into readerService for history retrieval
    readerService.service.setBorrowService(borrowService.service);

    // Register Routes
    app.use('/api/auth', authService.routes);
    app.use('/api/books', bookService.routes);
    app.use('/api/readers', readerService.routes);
    app.use('/api/borrow', borrowService.routes);
    app.use('/api/staff', staffService.routes);
    app.use('/api/reports', reportService.routes);

    // Root endpoint
    app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Library Management System API',
        documentation: '/api-docs',
        version: '1.0.0'
      });
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          auth: 'connected',
          book: 'connected',
          reader: 'connected',
          borrow: 'connected'
        }
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' });
    });

    // Error handling
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
