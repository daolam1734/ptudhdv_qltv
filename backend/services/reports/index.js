const connectDatabase = require('../../shared/config/database');
const BorrowModel = require('../borrow/models/Borrow.model'); // Reuse Borrow model
const ReportService = require('./services/Report.service');
const ReportController = require('./controllers/Report.controller');
const reportRoutes = require('./routes/report.routes');

let reportServiceInstance = null;

const initReportService = async () => {
  if (reportServiceInstance) {
    return reportServiceInstance;
  }

  // Connect to database (Uses same database as Borrow for aggregation)
  const connection = await connectDatabase(
    process.env.MONGODB_URI,
    'library_borrow'
  );

  const Borrow = BorrowModel(connection);
  const reportService = new ReportService(Borrow);
  const reportController = new ReportController(reportService);

  reportServiceInstance = {
    routes: reportRoutes(reportController),
    service: reportService,
    connection
  };

  return reportServiceInstance;
};

module.exports = initReportService;
