const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');
const reportController = require('../controllers/ReportController');

module.exports = () => {
  router.use(authMiddleware);
  router.use(authorize('admin', 'librarian'));
  router.get('/', reportController.getLibraryStats);
  router.get('/borrowed-books', reportController.getBorrowedBooksStats);
  router.get('/top-readers', reportController.getTopReaders);
  router.get('/activities', reportController.getRecentActivities);
  return router;
};
