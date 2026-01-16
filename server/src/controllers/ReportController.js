const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const reportService = require('../services/ReportService');

class ReportController {
  getBorrowedBooksStats = asyncHandler(async (req, res) => {
    const stats = await reportService.getBorrowedBooksStats();
    ApiResponse.success(res, stats, 'Borrowed books statistics retrieved');
  });

  getTopReaders = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const topReaders = await reportService.getTopReaders(limit);
    ApiResponse.success(res, topReaders, 'Top readers report retrieved');
  });

  getLibraryStats = asyncHandler(async (req, res) => {
    const stats = await reportService.getLibraryStats();
    ApiResponse.success(res, stats, 'Library statistics retrieved');
  });

  getRecentActivities = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const activities = await reportService.getRecentActivities(limit);
    ApiResponse.success(res, activities, 'Recent activities retrieved');
  });
}

module.exports = new ReportController();
