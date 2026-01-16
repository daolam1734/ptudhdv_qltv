const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class FineController {
  constructor(fineService) {
    this.fineService = fineService;
  }

  getReaderFines = asyncHandler(async (req, res) => {
    let readerId = req.params.readerId;
    if (req.user.role === 'reader') readerId = req.user.id;
    
    const fines = await this.fineService.getReaderFines(readerId);
    ApiResponse.success(res, fines, 'Reader fines retrieved');
  });

  payFine = asyncHandler(async (req, res) => {
    const { fineId } = req.params;
    const fine = await this.fineService.payFine(fineId, req.user.id);
    ApiResponse.success(res, fine, 'Fine paid successfully');
  });

  getAllFines = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const filter = status ? { status } : {};
    
    const result = await this.fineService.getAll(filter, { 
      page, 
      limit, 
      populate: ['readerId', 'borrowId'],
      sort: { createdAt: -1 } 
    });
    ApiResponse.paginated(res, result.data, result.pagination, 'Fines retrieved');
  });
}

module.exports = FineController;
