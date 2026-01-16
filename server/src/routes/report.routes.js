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
  router.get('/top-books', reportController.getTopBooks);
  router.get('/activities', reportController.getRecentActivities);
  router.get('/trends', reportController.getTrends);
  router.get('/export', reportController.exportReport);
  return router;
};
