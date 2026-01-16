const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");

module.exports = (borrowController) => {
  router.use(protect);

  // Reader paths
  router.get("/my-history", borrowController.getReaderHistory);
  router.get("/:id", borrowController.getBorrowById);
  
  // Create borrow (can be initiated by reader or staff)
  router.post("/", restrictTo("reader", "librarian", "admin"), borrowController.createBorrow);

  // Staff/Admin paths
  router.use(restrictTo("librarian", "admin"));
  
  router.get("/", borrowController.getAllBorrows);
  router.post("/:id/approve", borrowController.approveBorrow);
  router.post("/:id/issue", borrowController.issueBook);
  router.post("/:id/reject", borrowController.rejectBorrow);
  router.post("/:id/renew", borrowController.renewBorrow);
  router.post("/:id/return", borrowController.returnBook);
  router.get("/reader/:readerId", borrowController.getReaderHistory);

  return router;
};
