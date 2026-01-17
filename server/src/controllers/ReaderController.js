const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class ReaderController {
  constructor(readerService, borrowService, violationService) {
    this.readerService = readerService;
    this.borrowService = borrowService;
    this.violationService = violationService;
  }

  getAllReaders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.readerService.getAllReaders(filters, { page, limit });
    ApiResponse.paginated(res, result.data, result.pagination, 'Readers retrieved successfully');
  });

  getReaderById = asyncHandler(async (req, res) => {
    if (req.user.role === 'reader' && req.user.id !== req.params.id) return ApiResponse.error(res, 'Access denied', 403);
    const reader = await this.readerService.getById(req.params.id);
    ApiResponse.success(res, reader, 'Reader retrieved successfully');
  });

  updateReader = asyncHandler(async (req, res) => {
    if (req.user.role === 'reader' && req.user.id !== req.params.id) return ApiResponse.error(res, 'Access denied', 403);
    const reader = await this.readerService.updateReader(req.params.id, req.body);
    ApiResponse.success(res, reader, 'Reader updated successfully');
  });

  createReader = asyncHandler(async (req, res) => {
    const reader = await this.readerService.create(req.body);
    ApiResponse.success(res, reader, 'Reader created successfully', 201);
  });

  deleteReader = asyncHandler(async (req, res) => {
    await this.readerService.updateReader(req.params.id, { status: 'inactive' });
    ApiResponse.success(res, null, 'Reader deactivated successfully');
  });

  getBorrowHistory = asyncHandler(async (req, res) => {
    const readerId = req.params.id;
    if (req.user.role === 'reader' && req.user.id !== readerId) return ApiResponse.error(res, 'Access denied', 403);
    const history = await this.borrowService.getReaderHistory(readerId);
    ApiResponse.success(res, history, 'History retrieved successfully');
  });

  toggleFavorite = asyncHandler(async (req, res) => {
    const result = await this.readerService.toggleFavorite(req.user.id, req.params.bookId);
    ApiResponse.success(
      res, 
      result, 
      result.isFavorite ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích'
    );
  });

  getFavorites = asyncHandler(async (req, res) => {
    const favorites = await this.readerService.getFavorites(req.user.id);
    ApiResponse.success(res, favorites, 'Lấy danh sách yêu thích thành công');
  });

  getBasket = asyncHandler(async (req, res) => {
    const basket = await this.readerService.getBasket(req.user.id);
    ApiResponse.success(res, basket, 'Lấy tủ sách thành công');
  });

  updateBasket = asyncHandler(async (req, res) => {
    const basket = await this.readerService.updateBasket(req.user.id, req.body);
    ApiResponse.success(res, basket, 'Cập nhật tủ sách thành công');
  });

  clearBasket = asyncHandler(async (req, res) => {
    await this.readerService.clearBasket(req.user.id);
    ApiResponse.success(res, null, 'Đã xóa toàn bộ tủ sách');
  });

  payViolation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const result = await this.violationService.payViolationByReader(id, amount);
    ApiResponse.success(res, result, `Đã thanh toán ${amount.toLocaleString()}đ thành công`);
  });
}

module.exports = ReaderController;
