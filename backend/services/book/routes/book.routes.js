const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../../shared/middleware/authMiddleware');
const validate = require('../../../shared/middleware/validate');
const { bookValidator } = require('../middleware/bookValidator');

module.exports = (bookController) => {
  // Public routes (anyone can view)
  router.get('/search', bookController.searchBooks);
  router.get('/available', bookController.getAvailableBooks);
  router.get('/most-borrowed', bookController.getMostBorrowedBooks);
  router.get('/new-arrivals', bookController.getNewArrivals);
  router.get('/category/:category', bookController.getBooksByCategory);
  router.get('/author/:author', bookController.getBooksByAuthor);

  // Protected routes - All authenticated users can view
  router.get('/', authMiddleware, bookController.getAllBooks);
  router.get('/:id', authMiddleware, bookController.getBookById);
  router.get('/:id/availability', authMiddleware, bookController.checkAvailability);

  // Staff/Librarian/Admin only - Create, Update
  router.post('/',
    authMiddleware,
    authorize('admin', 'librarian', 'staff'),
    bookValidator,
    validate,
    bookController.createBook
  );

  router.put('/:id',
    authMiddleware,
    authorize('admin', 'librarian', 'staff'),
    bookValidator,
    validate,
    bookController.updateBook
  );

  router.patch('/:id/quantity',
    authMiddleware,
    authorize('admin', 'librarian', 'staff'),
    bookController.updateQuantity
  );

  // Admin/Librarian only - Delete, Statistics
  router.delete('/:id',
    authMiddleware,
    authorize('admin', 'librarian'),
    bookController.deleteBook
  );

  router.get('/stats/overview',
    authMiddleware,
    authorize('admin', 'librarian', 'staff'),
    bookController.getStatistics
  );

  return router;
};
