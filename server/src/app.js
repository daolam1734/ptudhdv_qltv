const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { swaggerUi, specs } = require("./config/swagger");

// Import Models
const Staff = require("./models/Staff");
const Reader = require("./models/Reader");
const Book = require("./models/Book");
const Borrow = require("./models/Borrow");
const Fine = require("./models/Fine");
const Category = require("./models/Category");

// Import Repositories
const StaffRepository = require("./repositories/StaffRepository");
const ReaderRepository = require("./repositories/ReaderRepository");
const BookRepository = require("./repositories/BookRepository");
const BorrowRepository = require("./repositories/BorrowRepository");
const FineRepository = require("./repositories/FineRepository");
const CategoryRepository = require("./repositories/CategoryRepository");

// Import Services
const AuthService = require("./services/AuthService");
const BookService = require("./services/BookService");
const ReaderService = require("./services/ReaderService");
const StaffService = require("./services/StaffService");
const BorrowService = require("./services/BorrowService");
const FineService = require("./services/FineService");
const CategoryService = require("./services/CategoryService");

// Import Controllers
const AuthController = require("./controllers/AuthController");
const BookController = require("./controllers/BookController");
const ReaderController = require("./controllers/ReaderController");
const StaffController = require("./controllers/StaffController");
const BorrowController = require("./controllers/BorrowController");
const FineController = require("./controllers/FineController");
const CategoryController = require("./controllers/CategoryController");
const reportController = require("./controllers/ReportController");

// Import Routes
const apiRoutes = require("./routes/index");

const createApp = async () => {
  const app = express();

  // Disable ETag for all requests
  app.set("etag", false);

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  }));
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));
  app.use(morgan("dev"));

  // No-cache middleware for API
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
  });

  // API Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  // Initialize Repositories
  const staffRepo = new StaffRepository(Staff);
  const readerRepo = new ReaderRepository(Reader);
  const bookRepo = new BookRepository(Book);
  const borrowRepo = new BorrowRepository(Borrow);
  const fineRepo = new FineRepository(Fine);
  const categoryRepo = new CategoryRepository(Category);

  // Initialize Services
  const authService = new AuthService(staffRepo, readerRepo);
  const bookService = new BookService(bookRepo);
  const readerService = new ReaderService(readerRepo);
  const staffService = new StaffService(staffRepo);
  const fineService = new FineService(fineRepo, readerService);
  const borrowService = new BorrowService(borrowRepo, bookService, readerService, fineService);
  const categoryService = new CategoryService(categoryRepo);

  // Initialize Controllers
  const authController = new AuthController(authService);
  const bookController = new BookController(bookService);
  const readerController = new ReaderController(readerService, borrowService);
  const staffController = new StaffController(staffService);
  const borrowController = new BorrowController(borrowService);
  const fineController = new FineController(fineService);
  const categoryController = new CategoryController(categoryService);

  // Register All Routes
  app.use("/api", apiRoutes({
    authController,
    bookController,
    borrowController,
    readerController,
    staffController,
    fineController,
    categoryController
  }));

  // Handle 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.stack);
    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  // Root endpoint
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Library Management System API (MVC)",
      documentation: "/api-docs",
      version: "2.0.0"
    });
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  // Error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error"
    });
  });

  return app;
};

module.exports = createApp;
