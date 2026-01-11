const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../../shared/middleware/authMiddleware');

module.exports = (reportController) => {
  // All report routes require admin or librarian authentication
  router.use(authMiddleware);
  router.use(authorize('admin', 'librarian'));

  router.get('/borrowed-books', reportController.getBorrowedBooksStats);
  router.get('/top-readers', reportController.getTopReaders);

  return router;
};
