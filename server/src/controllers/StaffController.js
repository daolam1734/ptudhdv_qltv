const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class StaffController {
  constructor(staffService) {
    this.staffService = staffService;
  }

  getAllStaff = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await this.staffService.getAllStaff(filters, { page, limit });
    ApiResponse.paginated(res, result.data, result.pagination, 'Staff members retrieved successfully');
  });

  createStaff = asyncHandler(async (req, res) => {
    const staff = await this.staffService.createStaff(req.body);
    ApiResponse.success(res, staff, 'Staff member created successfully', 201);
  });

  getStaffById = asyncHandler(async (req, res) => {
    const staff = await this.staffService.getById(req.params.id);
    ApiResponse.success(res, staff, 'Staff member details retrieved');
  });

  updateStaff = asyncHandler(async (req, res) => {
    const staff = await this.staffService.updateStaff(req.params.id, req.body);
    ApiResponse.success(res, staff, 'Staff member updated successfully');
  });

  deleteStaff = asyncHandler(async (req, res) => {
    await this.staffService.deleteStaff(req.params.id);
    ApiResponse.success(res, null, 'Staff member deleted successfully');
  });
}

module.exports = StaffController;
