const asyncHandler = require('../../../shared/middleware/asyncHandler');
const ApiResponse = require('../../../shared/utils/ApiResponse');

class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
  }

  // GET /reports/borrowed-books
  getBorrowedBooksStats = asyncHandler(async (req, res) => {
    const stats = await this.reportService.getBorrowedBooksStats();
    ApiResponse.success(res, stats, 'Borrowed books statistics retrieved');
  });

  // GET /reports/top-readers
  getTopReaders = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const topReaders = await this.reportService.getTopReaders(limit);
    ApiResponse.success(res, topReaders, 'Top readers report retrieved');
  });
}

module.exports = ReportController;
