const BaseService = require('../../../shared/base/BaseService');
const jwt = require('jsonwebtoken');
const { READER, ROLES } = require('../../../config/constants');

class AuthService extends BaseService {
  constructor(staffRepository, readerRepository) {
    super(staffRepository);
    this.readerRepository = readerRepository;
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async registerStaff(data) {
    // Check if username or email already exists
    const existingStaff = await this.repository.findOne({
      $or: [{ username: data.username }, { email: data.email }]
    });

    if (existingStaff) {
      throw new Error('Username or email already exists');
    }

    const staff = await this.repository.create(data);
    const token = this.generateToken(staff);

    return { user: staff, token };
  }

  async registerReader(data) {
    // Check if username, email or idCard already exists
    const existingByUsername = await this.readerRepository.findByUsername(data.username);
    const existingByEmail = await this.readerRepository.findByEmail(data.email);
    const existingByIdCard = await this.readerRepository.findByIdCard(data.idCard);

    if (existingByUsername) {
      throw new Error('Username already exists');
    }
    if (existingByEmail) {
      throw new Error('Email already exists');
    }
    if (existingByIdCard) {
      throw new Error('ID card number already exists');
    }

    // Set default values for reader
    const readerData = {
      ...data,
      role: ROLES.READER,
      membershipType: data.membershipType || 'basic',
      borrowLimit: data.membershipType === 'premium' ? READER.PREMIUM_LIMIT : data.membershipType === 'vip' ? READER.VIP_LIMIT : READER.DEFAULT_LIMIT
    };

    const reader = await this.readerRepository.create(readerData);
    const token = this.generateToken(reader);

    return { user: reader, token };
  }

  async login(username, password) {
    // Try to find staff first
    let user = await this.repository.findByUsername(username);
    let userType = 'staff';

    if (!user) {
      user = await this.repository.findByEmail(username);
    }

    // If not found in staff, try reader
    if (!user) {
      user = await this.readerRepository.findByUsername(username);
      userType = 'reader';
    }

    if (!user) {
      user = await this.readerRepository.findByEmail(username);
      userType = 'reader';
    }

    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    // Check if account is active
    if (user.status !== 'active') {
      const error = new Error('Account is not active');
      error.status = 403;
      throw error;
    }

    // For readers, check membership expiry
    if (userType === 'reader' && user.isMembershipExpired && user.isMembershipExpired()) {
      const error = new Error('Membership has expired. Please renew your membership');
      error.status = 403;
      throw error;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    // Update last login
    if (userType === 'staff') {
      await this.repository.updateLastLogin(user._id);
    } else {
      await this.readerRepository.updateLastLogin(user._id);
    }

    const token = this.generateToken(user);

    // Remove password from response
    user.password = undefined;

    return { user, token };
  }

  async changePassword(staffId, oldPassword, newPassword) {
    const staff = await this.repository.findById(staffId);
    if (!staff) {
      throw new Error('Staff not found');
    }

    // Verify old password
    const isPasswordValid = await staff.comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await this.repository.changePassword(staffId, newPassword);

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId, userRole) {
    if (userRole === 'reader') {
      return await this.readerRepository.findById(userId);
    }
    return await this.repository.findById(userId);
  }

  async updateProfile(userId, userRole, data) {
    // Remove sensitive fields
    delete data.password;
    delete data.role;
    delete data.username;
    delete data.idCard; // Readers can't change ID card

    if (userRole === 'reader') {
      return await this.readerRepository.update(userId, data);
    }
    return await this.repository.update(userId, data);
  }

  async getAllReaders(filter = {}, options = {}) {
    return await this.readerRepository.findAll(filter, options);
  }

  async getAllStaff(filter = {}, options = {}) {
    return await this.repository.findAll(filter, options);
  }
}

module.exports = AuthService;
