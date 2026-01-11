const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../../shared/middleware/authMiddleware');
const validate = require('../../../shared/middleware/validate');
const { borrowValidator, returnValidator } = require('../middleware/borrowValidator');

module.exports = (borrowController) => {
    router.use(authMiddleware);

    // Staff/Admin routes
    router.post('/', authorize('admin', 'librarian', 'staff'), borrowValidator, validate, borrowController.createBorrow);
    router.post('/return', authorize('admin', 'librarian', 'staff'), returnValidator, validate, borrowController.returnBook);
    router.get('/all', authorize('admin', 'librarian', 'staff'), borrowController.getAllBorrows);

    // Shared routes
    router.get('/history/:readerId', borrowController.getReaderHistory);

    return router;
};
