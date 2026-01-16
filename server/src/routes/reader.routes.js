const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createReaderValidator, updateReaderValidator } = require('../validators/readerValidator');

module.exports = (readerController) => {
  router.use(authMiddleware);
  router.get('/', authorize('admin', 'librarian'), readerController.getAllReaders);
  router.post('/', authorize('admin', 'librarian'), createReaderValidator, validate, readerController.createReader);
  router.get('/:id', readerController.getReaderById);
  router.put('/:id', updateReaderValidator, validate, readerController.updateReader);
  router.delete('/:id', authorize('admin', 'librarian'), readerController.deleteReader);
  router.get('/:id/borrow-history', readerController.getBorrowHistory);
  router.post('/:id/pay-violation', authorize('admin', 'librarian'), readerController.payViolation);

  // Favorites
  router.get('/me/favorites', readerController.getFavorites);
  router.post('/me/favorites/:bookId', readerController.toggleFavorite);

  return router;
};
