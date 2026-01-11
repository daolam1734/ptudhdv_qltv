const asyncHandler = require('../../../shared/middleware/asyncHandler');
const ApiResponse = require('../../../shared/utils/ApiResponse');

class BookController {
  constructor(bookService) {
    this.bookService = bookService;
  }

  /**
   * @openapi
   * /books:
   *   get:
   *     summary: Get all books
   *     tags: [Books]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: {type: integer}
   *       - in: query
   *         name: limit
   *         schema: {type: integer}
   *     responses:
   *       200:
   *         description: Success
   */
  getAllBooks = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await this.bookService.getAllBooks(filters, { page, limit });

    ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'Books retrieved successfully'
    );
  });

  // GET /books/:id - Get book by ID
  getBookById = asyncHandler(async (req, res) => {
    const book = await this.bookService.getBookById(req.params.id);
    ApiResponse.success(res, book, 'Book retrieved successfully');
  });

  // POST /books - Create new book (Staff/Admin only)
  createBook = asyncHandler(async (req, res) => {
    const book = await this.bookService.createBook(req.body, req.user.id);
    ApiResponse.success(res, book, 'Book created successfully', 201);
  });

  // PUT /books/:id - Update book (Staff/Admin only)
  updateBook = asyncHandler(async (req, res) => {
    const book = await this.bookService.updateBook(
      req.params.id,
      req.body,
      req.user.id
    );
    ApiResponse.success(res, book, 'Book updated successfully');
  });

  // DELETE /books/:id - Delete book (Admin only)
  deleteBook = asyncHandler(async (req, res) => {
    await this.bookService.deleteBook(req.params.id);
    ApiResponse.success(res, null, 'Book deleted successfully');
  });

  // GET /books/search - Search books
  searchBooks = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return ApiResponse.error(res, 'Search query (q) is required', 400);
    }

    const result = await this.bookService.searchBooks(q, { page, limit });

    ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'Search completed successfully'
    );
  });

  // GET /books/available - Get available books
  getAvailableBooks = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;

    const result = await this.bookService.getAvailableBooks(filters, { page, limit });

    ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'Available books retrieved successfully'
    );
  });

  // GET /books/category/:category - Get books by category
  getBooksByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await this.bookService.getBooksByCategory(category, { page, limit });

    ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      `Books in category "${category}" retrieved successfully`
    );
  });

  // GET /books/author/:author - Get books by author
  getBooksByAuthor = asyncHandler(async (req, res) => {
    const { author } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await this.bookService.getBooksByAuthor(author, { page, limit });

    ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      `Books by "${author}" retrieved successfully`
    );
  });

  // GET /books/:id/availability - Check book availability
  checkAvailability = asyncHandler(async (req, res) => {
    const availability = await this.bookService.checkAvailability(req.params.id);
    ApiResponse.success(res, availability, 'Availability checked successfully');
  });

  // PATCH /books/:id/quantity - Update book quantity (Staff/Admin only)
  updateQuantity = asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return ApiResponse.error(res, 'Valid quantity is required', 400);
    }

    const book = await this.bookService.updateQuantity(req.params.id, quantity);
    ApiResponse.success(res, book, 'Quantity updated successfully');
  });

  // GET /books/stats - Get book statistics (Staff/Admin only)
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await this.bookService.getStatistics();
    ApiResponse.success(res, stats, 'Statistics retrieved successfully');
  });

  // GET /books/most-borrowed - Get most borrowed books
  getMostBorrowedBooks = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const books = await this.bookService.getMostBorrowedBooks(parseInt(limit));
    ApiResponse.success(res, books, 'Most borrowed books retrieved successfully');
  });

  // GET /books/new-arrivals - Get new arrivals
  getNewArrivals = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const books = await this.bookService.getNewArrivals(parseInt(limit));
    ApiResponse.success(res, books, 'New arrivals retrieved successfully');
  });
}

module.exports = BookController;
