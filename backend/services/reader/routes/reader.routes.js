const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../../shared/middleware/authMiddleware');

module.exports = (readerController) => {
    // All reader routes require authentication
    router.use(authMiddleware);

    // Staff and Admin can view all
    router.get('/', authorize('admin', 'librarian', 'staff'), readerController.getAllReaders);

    // Reader, Staff, Admin can view/edit specific
    router.get('/:id', readerController.getReaderById);
    router.put('/:id', readerController.updateReader);
    router.get('/:id/borrow-history', readerController.getBorrowHistory);

    return router;
};
