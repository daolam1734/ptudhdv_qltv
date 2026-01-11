const asyncHandler = require('../../../shared/middleware/asyncHandler');
const ApiResponse = require('../../../shared/utils/ApiResponse');

class ReaderController {
    constructor(readerService) {
        this.readerService = readerService;
    }

    // GET /readers - Staff/Admin only
    getAllReaders = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, ...filters } = req.query;
        const result = await this.readerService.getAllReaders(filters, { page, limit });

        ApiResponse.paginated(
            res,
            result.data,
            result.pagination,
            'Readers retrieved successfully'
        );
    });

    // GET /readers/:id - Staff/Admin or the Reader themselves
    getReaderById = asyncHandler(async (req, res) => {
        // Check permission: Admin, Staff, or the Reader themselves
        if (req.user.role === 'reader' && req.user.id !== req.params.id) {
            return ApiResponse.error(res, 'Access denied. You can only view your own profile', 403);
        }

        const reader = await this.readerService.getById(req.params.id);
        ApiResponse.success(res, reader, 'Reader retrieved successfully');
    });

    // PUT /readers/:id - Staff/Admin or the Reader themselves
    updateReader = asyncHandler(async (req, res) => {
        // Check permission
        if (req.user.role === 'reader' && req.user.id !== req.params.id) {
            return ApiResponse.error(res, 'Access denied. You can only update your own profile', 403);
        }

        const reader = await this.readerService.updateReader(req.params.id, req.body);
        ApiResponse.success(res, reader, 'Reader updated successfully');
    });

    // GET /readers/:id/borrow-history
    getBorrowHistory = asyncHandler(async (req, res) => {
        if (req.user.role === 'reader' && req.user.id !== req.params.id) {
            return ApiResponse.error(res, 'Access denied', 403);
        }

        // This will eventually fetch data from the Borrow Service
        const history = await this.readerService.getBorrowHistory(req.params.id);
        ApiResponse.success(res, history, 'History retrieved successfully');
    });
}

module.exports = ReaderController;
