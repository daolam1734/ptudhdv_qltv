const express = require('express');
const router = express.Router();

module.exports = (controllers) => {
  const {
    authController,
    bookController,
    borrowController,
    readerController,
    staffController,
    fineController,
    categoryController
  } = controllers;

  // Import existing route factories
  const authRoutes = require('./auth.routes');
  const bookRoutes = require('./book.routes');
  const borrowRoutes = require('./borrow.routes');
  const readerRoutes = require('./reader.routes');
  const reportRoutesFactory = require('./report.routes');
  const staffRoutes = require('./staff.routes');
  const fineRoutes = require('./fine.routes');
  const categoryRoutes = require('./category.routes');

  // Register all modules
  router.use('/auth', authRoutes(authController));
  router.use('/books', bookRoutes(bookController));
  router.use('/borrow', borrowRoutes(borrowController));
  router.use('/readers', readerRoutes(readerController));
  router.use('/reports', reportRoutesFactory());
  router.use('/staff', staffRoutes(staffController));
  router.use('/fines', fineRoutes(fineController));
  router.use('/categories', categoryRoutes(categoryController));

  return router;
};
