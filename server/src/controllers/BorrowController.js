const asyncHandler = require("../middlewares/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const Reader = require("../models/Reader");
const Book = require("../models/Book");

/**
 * @swagger
 * tags:
 *   name: Borrow
 *   description: Circulation and borrowing management
 */
class BorrowController {
  constructor(borrowService) {
    this.borrowService = borrowService;
  }

  /**
   * @swagger
   * /borrow:
   *   post:
   *     summary: Create a borrow request or issue a book
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [bookId]
   *             properties:
   *               bookId: { type: string }
   *               readerId: { type: string, description: "Required for staff, ignored for readers" }
   *               durationDays: { type: integer, default: 14 }
   *     responses:
   *       201:
   *         description: Borrow record created
   */
  createBorrow = asyncHandler(async (req, res) => {
    let { readerId, bookId, bookIds, durationDays } = req.body;
    const isReader = req.user.role === "reader";
    if (isReader) readerId = req.user.id;

    if (!readerId || (!bookId && (!bookIds || bookIds.length === 0))) {
      return ApiResponse.error(res, "readerId and bookId/bookIds are required", 400);
    }

    const record = await this.borrowService.borrowBook({
      readerId,
      bookId,
      bookIds,
      staffId: isReader ? null : req.user.id,
      durationDays
    });
    ApiResponse.success(res, record, isReader ? "Borrow request submitted successfully" : "Book borrow record created", 201);
  });

  /**
   * @swagger   * /borrow/cancel/{id}:
   *   patch:
   *     summary: Cancel a pending borrow request (Reader only)
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200:
   *         description: Cancelled successfully
   */
  cancelBorrow = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await this.borrowService.cancelBorrow(id, req.user.id);
    ApiResponse.success(res, record, "Yêu cầu mượn đã được hủy thành công");
  });

  /**
   * @swagger   * /borrow/approve/{id}:
   *   patch:
   *     summary: Approve a pending borrow request (Staff only)
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200:
   *         description: Approved successfully
   */
  approveBorrow = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await this.borrowService.approveBorrow(id, req.user.id);
    ApiResponse.success(res, record, "Borrow request approved. Waiting for reader to pick up.");
  });

  /**
   * @swagger
   * /borrow/issue/{id}:
   *   patch:
   *     summary: Mark book as collected/issued to reader (Staff only)
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200:
   *         description: Issued successfully
   */
  issueBook = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await this.borrowService.issueBook(id, req.user.id);
    ApiResponse.success(res, record, "Book issued to reader. Borrow period started.");
  });

  /**
   * @swagger
   * /borrow/reject/{id}:
   *   patch:
   *     summary: Reject a pending borrow request (Staff only)
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200:
   *         description: Rejected successfully
   */
  rejectBorrow = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    const record = await this.borrowService.rejectBorrow(id, req.user.id, notes);
    ApiResponse.success(res, record, "Borrow request rejected");
  });

  /**
   * @swagger
   * /borrow/renew/{id}:
   *   patch:
   *     summary: Renew a borrow duration (+14 days)
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200:
   *         description: Renewed successfully
   */
  renewBorrow = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await this.borrowService.renewBorrow(id);
    ApiResponse.success(res, record, "Borrow period extended successfully");
  });

  /**
   * @swagger
   * /borrow/return/{id}:
   *   patch:
   *     summary: Process book return (Staff only)
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status: { type: string, enum: [returned, damaged, damaged_heavy, lost] }
   *               notes: { type: string }
   *     responses:
   *       200:
   *         description: Processed successfully
   */
  returnBook = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const result = await this.borrowService.returnBook(id, req.user.id, { status, notes });

    let message = "Book returned successfully";
    if (result.violation) {
      message += `. A violation fee of ${result.violation.amount} VND was recorded due to ${result.violation.reason}.`;
    }

    ApiResponse.success(res, result, message);
  });

  /**
   * @swagger
   * /borrow/history/{readerId}:
   *   get:
   *     summary: Get borrow history of a reader
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: readerId
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: List of history records
   */
  getReaderHistory = asyncHandler(async (req, res) => {
    let readerId = req.params.readerId;

    // If no readerId in params, it's "my-history"
    if (!readerId) {
      if (req.user.role === "reader") {
        readerId = req.user.id;
      } else {
        return ApiResponse.error(res, "readerId is required", 400);
      }
    }

    if (req.user.role === "reader" && req.user.id !== readerId.toString()) {
      return ApiResponse.error(res, "Access denied", 403);
    }
    const history = await this.borrowService.repository.model.find({ readerId })
      .populate({ path: 'bookId', select: 'title isbn coverImage author' })
      .select('borrowDate dueDate returnDate status notes')
      .sort({ createdAt: -1 })
      .lean();
      
    ApiResponse.success(res, history, "Borrow history retrieved");
  });

  /**
   * @swagger
   * /borrow:
   *   get:
   *     summary: Get all borrow records with filters (Staff only)
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema: { type: string }
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Paginated list of records
   */
  getAllBorrows = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, readerId, bookId, search } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      if (status === 'overdue') {
        const now = new Date();
        filter.$or = [
          { status: 'overdue' },
          { 
            status: 'borrowed',
            dueDate: { $lt: now }
          }
        ];
      } else if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }
    if (readerId) filter.readerId = readerId;
    if (bookId) filter.bookId = bookId;

    // Handle search by multiple fields
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();

      // Search readers by multiple fields
      const readers = await Reader.find({
        $or: [
          { fullName: { $regex: searchTerm, $options: "i" } },
          { username: { $regex: searchTerm, $options: "i" } },
          { idCard: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } }
        ]
      }).select("_id");

      // Search books by title or ISBN
      const books = await Book.find({
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { isbn: { $regex: searchTerm, $options: "i" } }
        ]
      }).select("_id");

      const readerIds = readers.map(r => r._id);
      const bookIds = books.map(b => b._id);

      const searchConditions = [
        { readerId: { $in: readerIds } },
        { bookId: { $in: bookIds } }
      ];

      // If search matches an ObjectId format exactly
      if (searchTerm.match(/^[0-9a-fA-F]{24}$/)) {
        searchConditions.push({ _id: searchTerm });
      }

      filter.$or = searchConditions;
    }

    const result = await this.borrowService.getAll(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'bookId', select: 'title isbn coverImage author price' },
        { path: 'readerId', select: 'fullName username idCard phone email' }
      ],
      select: '-__v',
      sort: { createdAt: -1 }
    });

    ApiResponse.paginated(res, result.data, result.pagination, "Records retrieved");
  });

  /**
   * @swagger
   * /borrow/{id}:
   *   get:
   *     summary: Get specific borrow record details
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200:
   *         description: Record details
   */
  getBorrowById = asyncHandler(async (req, res) => {
    const record = await this.borrowService.getById(req.params.id);
    if (!record) return ApiResponse.error(res, "Borrow record not found", 404);

    if (req.user.role === "reader" && record.readerId.toString() !== req.user.id) {
      return ApiResponse.error(res, "Access denied", 403);
    }

    ApiResponse.success(res, record, "Borrow record retrieved");
  });

  /**
   * @swagger
   * /borrow/stats:
   *   get:
   *     summary: Get borrow statistics
   *     tags: [Borrow]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Statistics retrieved
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await this.borrowService.getStatistics();
    ApiResponse.success(res, stats, "Borrow statistics retrieved");
  });
}

module.exports = BorrowController;
