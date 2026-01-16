const express = require('express');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

module.exports = (fineController) => {
  // All fine routes require authentication
  router.use(protect);

  // Readers can view their own fines
  router.get('/my-fines', fineController.getReaderFines);

  // Staff and Admin routes
  router.use(restrictTo('librarian', 'admin'));
  
  router.get('/', fineController.getAllFines);
  router.get('/reader/:readerId', fineController.getReaderFines);
  router.post('/:fineId/pay', fineController.payFine);

  return router;
};
