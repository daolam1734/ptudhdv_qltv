const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { bookValidator } = require('../validators/bookValidator');

module.exports = (bookController) => {
  router.get('/', bookController.getAllBooks);
  router.get('/search', bookController.searchBooks);
  router.get('/categories', bookController.getCategories);
  router.get('/stats', authMiddleware, authorize('admin', 'librarian'), bookController.getStatistics);
  router.get('/:id', bookController.getBookById);

  router.post('/', authMiddleware, authorize('admin', 'librarian'), bookValidator, validate, bookController.createBook);
  router.put('/:id', authMiddleware, authorize('admin', 'librarian'), bookValidator, validate, bookController.updateBook);
  router.delete('/:id', authMiddleware, authorize('admin', 'librarian'), bookController.deleteBook);

  return router;
};
