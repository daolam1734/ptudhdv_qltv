const asyncHandler = require('../../../shared/middleware/asyncHandler');
const ApiResponse = require('../../../shared/utils/ApiResponse');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * @openapi
   * /auth/register:
   *   post:
   *     summary: Register a new reader
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username: {type: string}
   *               email: {type: string}
   *               password: {type: string}
   *               fullName: {type: string}
   *               phone: {type: string}
   *               idCard: {type: string}
   *               dateOfBirth: {type: string}
   *     responses:
   *       201:
   *         description: Success
   */
  register = asyncHandler(async (req, res) => {
    const { user, token } = await this.authService.registerReader(req.body);

    ApiResponse.success(
      res,
      { user, token },
      'Reader registration successful',
      201
    );
  });

  // Register new staff (admin only)
  registerStaff = asyncHandler(async (req, res) => {
    const { user, token } = await this.authService.registerStaff(req.body);

    ApiResponse.success(
      res,
      { user, token },
      'Staff registration successful',
      201
    );
  });

  // Login (both staff and reader)
  login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return ApiResponse.error(res, 'Username and password are required', 400);
    }

    const { user, token } = await this.authService.login(username, password);

    ApiResponse.success(res, { user, token }, 'Login successful');
  });

  // Get current user profile
  getMe = asyncHandler(async (req, res) => {
    const user = await this.authService.getProfile(req.user.id, req.user.role);
    ApiResponse.success(res, user, 'Profile retrieved successfully');
  });

  // Update current user profile
  updateProfile = asyncHandler(async (req, res) => {
    const user = await this.authService.updateProfile(req.user.id, req.user.role, req.body);
    ApiResponse.success(res, user, 'Profile updated successfully');
  });

  // Change password
  changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return ApiResponse.error(res, 'Old password and new password are required', 400);
    }

    const result = await this.authService.changePassword(
      req.user.id,
      oldPassword,
      newPassword
    );

    ApiResponse.success(res, result, 'Password changed successfully');
  });

  // Get all readers (staff/admin only)
  getAllReaders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, membershipType } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (membershipType) filter.membershipType = membershipType;

    const result = await this.authService.getAllReaders(filter, { page, limit });

    ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'Readers retrieved successfully'
    );
  });

  // Get all staff (admin only)
  getAllStaff = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, status } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const result = await this.authService.getAllStaff(filter, { page, limit });

    ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'Staff retrieved successfully'
    );
  });
}

module.exports = AuthController;
