const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class ViolationController {
  constructor(violationService) {
    this.violationService = violationService;
  }

  getReaderViolations = asyncHandler(async (req, res) => {
    let readerId = req.params.readerId;
    if (req.user.role === 'reader') readerId = req.user.id;
    
    const violations = await this.violationService.getReaderViolations(readerId);
    ApiResponse.success(res, violations, 'Reader violations retrieved');
  });

  payViolation = asyncHandler(async (req, res) => {
    const { violationId } = req.params;
    const violation = await this.violationService.payViolation(violationId, req.user.id);
    ApiResponse.success(res, violation, 'Violation paid successfully');
  });

  getAllViolations = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const filter = status ? { status } : {};
    
    const result = await this.violationService.getAll(filter, { 
      page, 
      limit, 
      populate: ['readerId', 'borrowId'],
      sort: { createdAt: -1 } 
    });
    ApiResponse.paginated(res, result.data, result.pagination, 'Violations retrieved');
  });
}

module.exports = ViolationController;
