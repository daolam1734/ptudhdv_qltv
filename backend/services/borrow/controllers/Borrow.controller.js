const asyncHandler = require('../../../shared/middleware/asyncHandler');
const ApiResponse = require('../../../shared/utils/ApiResponse');

class BorrowController {
    constructor(borrowService) {
        this.borrowService = borrowService;
    }

    // POST /borrow - Staff/Admin only
    createBorrow = asyncHandler(async (req, res) => {
        const borrowData = {
            ...req.body,
            staffId: req.user.id // The staff member performing the action
        };

        const record = await this.borrowService.borrowBook(borrowData);
        ApiResponse.success(res, record, 'Book borrowed successfully', 201);
    });

    // POST /borrow/return - Staff/Admin only
    returnBook = asyncHandler(async (req, res) => {
        const { borrowId, notes } = req.body;

        if (!borrowId) {
            return ApiResponse.error(res, 'borrowId is required', 400);
        }

        const record = await this.borrowService.returnBook(borrowId, req.user.id, notes);
        ApiResponse.success(res, record, 'Book returned successfully');
    });

    // GET /borrow/reader/:readerId
    getReaderHistory = asyncHandler(async (req, res) => {
        const { readerId } = req.params;

        // Permission check
        if (req.user.role === 'reader' && req.user.id !== readerId) {
            return ApiResponse.error(res, 'Access denied', 403);
        }

        const history = await this.borrowService.getReaderHistory(readerId);
        ApiResponse.success(res, history, 'Borrow history retrieved');
    });

    // GET /borrow/all - Admin/Staff only
    getAllBorrows = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, status } = req.query;
        const filter = status ? { status } : {};

        const result = await this.borrowService.repository.findAll(filter, {
            page,
            limit,
            populate: ['bookId', 'readerId'],
            sort: { createdAt: -1 }
        });

        ApiResponse.paginated(res, result.data, result.pagination, 'Records retrieved');
    });
}

module.exports = BorrowController;
