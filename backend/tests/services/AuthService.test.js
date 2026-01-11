const AuthService = require('../../services/auth/services/Auth.service');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService;
  let mockStaffRepo;
  let mockReaderRepo;

  beforeEach(() => {
    mockStaffRepo = {
      findOne: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn()
    };
    mockReaderRepo = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      findByIdCard: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn()
    };
    authService = new AuthService(mockStaffRepo, mockReaderRepo);
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const user = { _id: '123', username: 'testuser', email: 'test@test.com', role: 'reader' };
      jwt.sign.mockReturnValue('mock_token');

      const token = authService.generateToken(user);

      expect(token).toBe('mock_token');
      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw error if user not found', async () => {
      mockStaffRepo.findByUsername.mockResolvedValue(null);
      mockStaffRepo.findByEmail.mockResolvedValue(null);
      mockReaderRepo.findByUsername.mockResolvedValue(null);
      mockReaderRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.login('wrong', 'pass')).rejects.toThrow('Invalid credentials');
    });

    it('should return user and token on successful login', async () => {
      const mockUser = {
        _id: '123',
        username: 'staff1',
        status: 'active',
        comparePassword: jest.fn().mockResolvedValue(true),
        role: 'staff'
      };
      mockStaffRepo.findByUsername.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock_token');

      const result = await authService.login('staff1', 'password');

      expect(result.token).toBe('mock_token');
      expect(result.user).toBeDefined();
      expect(mockStaffRepo.updateLastLogin).toHaveBeenCalledWith('123');
    });
  });
});
