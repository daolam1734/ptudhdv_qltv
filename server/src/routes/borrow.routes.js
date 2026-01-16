const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { borrowValidator, returnValidator, renewValidator } = require("../validators/borrowValidator");

module.exports = (borrowController) => {
  router.use(protect);

  // Specific routes first
  router.get("/stats", restrictTo("librarian", "admin"), borrowController.getStatistics);
  router.get("/my-history", borrowController.getReaderHistory);
  
  // Dynamic routes
  router.get("/:id", borrowController.getBorrowById);
  
  // Create borrow (can be initiated by reader or staff)
  router.post("/", restrictTo("reader", "librarian", "admin"), borrowValidator, validate, borrowController.createBorrow);
  
  // Reader cancellation
  router.post("/:id/cancel", restrictTo("reader"), borrowController.cancelBorrow);

  // Staff/Admin paths
  router.use(restrictTo("librarian", "admin"));
  
  router.get("/", borrowController.getAllBorrows);
  router.post("/:id/approve", borrowController.approveBorrow);
  router.post("/:id/issue", borrowController.issueBook);
  router.post("/:id/reject", borrowController.rejectBorrow);
  router.post("/:id/renew", renewValidator, validate, borrowController.renewBorrow);
  router.post("/:id/return", returnValidator, validate, borrowController.returnBook);
  router.get("/reader/:readerId", borrowController.getReaderHistory);

  return router;
};
