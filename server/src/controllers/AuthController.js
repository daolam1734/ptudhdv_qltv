const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization management
 */
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * @swagger
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
   *             required: [username, password, email, fullName]
   *             properties:
   *               username: { type: string }
   *               password: { type: string }
   *               email: { type: string }
   *               fullName: { type: string }
   *     responses:
   *       201:
   *         description: Registration successful
   *       400:
   *         description: Invalid input
   */
  register = asyncHandler(async (req, res) => {
    const { user, token } = await this.authService.registerReader(req.body);
    ApiResponse.success(res, { accessToken: token, role: 'READER' }, 'Reader registration successful', 201);
  });

  /**
   * @swagger
   * /auth/register-staff:
   *   post:
   *     summary: Register a new staff member (Admin only)
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, password, email, fullName, role]
   *             properties:
   *               username: { type: string }
   *               password: { type: string }
   *               email: { type: string }
   *               fullName: { type: string }
   *               role: { type: string, enum: [admin, librarian] }
   *     responses:
   *       201:
   *         description: Staff registration successful
   */
  registerStaff = asyncHandler(async (req, res) => {
    const { user, token } = await this.authService.registerStaff(req.body);
    ApiResponse.success(res, { accessToken: token, role: user.role === 'admin' ? 'ADMIN' : 'LIBRARIAN' }, 'Staff registration successful', 201);
  });

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: User login
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, password]
   *             properties:
   *               username: { type: string }
   *               password: { type: string }
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return ApiResponse.error(res, 'Username and password are required', 400);

    const { user, token } = await this.authService.login(username, password);
    const roleMapping = { 'admin': 'ADMIN', 'librarian': 'LIBRARIAN', 'reader': 'READER' };
    
    ApiResponse.success(res, { 
      token, 
      role: roleMapping[user.role] || user.role.toUpperCase(),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    }, 'Login successful');
  });

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current user profile
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Profile data
   */
  getMe = asyncHandler(async (req, res) => {
    const user = await this.authService.getProfile(req.user.id, req.user.role);
    ApiResponse.success(res, user, 'Profile retrieved successfully');
  });

  /**
   * @swagger
   * /auth/profile:
   *   put:
   *     summary: Update profile
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Profile updated
   */
  updateProfile = asyncHandler(async (req, res) => {
    const user = await this.authService.updateProfile(req.user.id, req.user.role, req.body);
    ApiResponse.success(res, user, 'Profile updated successfully');
  });

  /**
   * @swagger
   * /auth/change-password:
   *   post:
   *     summary: Change password
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [oldPassword, newPassword]
   *     responses:
   *       200:
   *         description: Password changed
   */
  changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return ApiResponse.error(res, 'Old password and new password are required', 400);

    await this.authService.changePassword(req.user.id, req.user.role, oldPassword, newPassword);
    ApiResponse.success(res, null, 'Password changed successfully');
  });
}

module.exports = AuthController;
