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

  getTopBooks = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    const topBooks = await reportService.getTopBooks(limit);
    ApiResponse.success(res, topBooks, 'Top books report retrieved');
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

  getTrends = asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;
    const trends = await reportService.getBorrowReturnTrends(parseInt(days));
    ApiResponse.success(res, trends, 'Borrow and return trends retrieved');
  });

  exportReport = asyncHandler(async (req, res) => {
    const { type = 'summary' } = req.query;
    const data = await reportService.getExportData(type);
    ApiResponse.success(res, data, `Export data for ${type} retrieved`);
  });
}

module.exports = new ReportController();
