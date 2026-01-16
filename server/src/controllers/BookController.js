const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Library collection management
 */
class BookController {
  constructor(bookService) {
    this.bookService = bookService;
  }

  /**
   * @swagger
   * /books:
   *   get:
   *     summary: Get all books with filters
   *     tags: [Books]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 10 }
   *       - in: query
   *         name: category
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: List of books
   */
  getAllBooks = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.bookService.getAllBooks(filters, { page, limit });
    ApiResponse.paginated(res, result.data, result.pagination, 'Books retrieved successfully');
  });

  /**
   * @swagger
   * /books/{id}:
   *   get:
   *     summary: Get book details by ID
   *     tags: [Books]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Book details
   */
  getBookById = asyncHandler(async (req, res) => {
    const book = await this.bookService.getById(req.params.id);
    ApiResponse.success(res, book, 'Book retrieved successfully');
  });

  /**
   * @swagger
   * /books:
   *   post:
   *     summary: Create a new book entry (Staff only)
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, author, category, price, quantity]
   *     responses:
   *       201:
   *         description: Book created
   */
  createBook = asyncHandler(async (req, res) => {
    const book = await this.bookService.createBook(req.body);
    ApiResponse.success(res, book, 'Book created successfully', 201);
  });

  /**
   * @swagger
   * /books/{id}:
   *   put:
   *     summary: Update book entry
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200:
   *         description: Book updated
   */
  updateBook = asyncHandler(async (req, res) => {
    const book = await this.bookService.updateBook(req.params.id, req.body);
    ApiResponse.success(res, book, 'Book updated successfully');
  });

  /**
   * @swagger
   * /books/{id}:
   *   delete:
   *     summary: Delete book (Admin only)
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     responses:
   *       200:
   *         description: Book deleted
   */
  deleteBook = asyncHandler(async (req, res) => {
    await this.bookService.deleteBook(req.params.id);
    ApiResponse.success(res, null, 'Book deleted successfully');
  });

  /**
   * @swagger
   * /books/search:
   *   get:
   *     summary: Full text search for books
   *     tags: [Books]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Search results
   */
  searchBooks = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) return ApiResponse.error(res, 'Search query (q) is required', 400);
    const result = await this.bookService.searchBooks(q, { page, limit });
    ApiResponse.paginated(res, result.data, result.pagination, 'Search completed successfully');
  });

  /**
   * @swagger
   * /books/stats:
   *   get:
   *     summary: Get library statistics
   *     tags: [Books]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Stats data
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await this.bookService.getStatistics();
    ApiResponse.success(res, stats, 'Book statistics retrieved successfully');
  });

  /**
   * @swagger
   * /books/categories:
   *   get:
   *     summary: Get all book categories
   *     tags: [Books]
   *     responses:
   *       200:
   *         description: List of categories
   */
  getCategories = asyncHandler(async (req, res) => {
    const categories = await this.bookService.getCategories();
    ApiResponse.success(res, categories, 'Categories retrieved successfully');
  });
}

module.exports = BookController;
