const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

module.exports = (readerController) => {
  router.use(authMiddleware);
  router.get('/', authorize('admin', 'librarian'), readerController.getAllReaders);
  router.post('/', authorize('admin', 'librarian'), readerController.createReader);
  router.get('/:id', readerController.getReaderById);
  router.put('/:id', readerController.updateReader);
  router.delete('/:id', authorize('admin', 'librarian'), readerController.deleteReader);
  router.get('/:id/history', readerController.getBorrowHistory);

  // Favorites
  router.get('/me/favorites', readerController.getFavorites);
  router.post('/me/favorites/:bookId', readerController.toggleFavorite);

  return router;
};
