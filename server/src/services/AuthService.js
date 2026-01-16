const BaseService = require('../utils/BaseService');
const jwt = require('jsonwebtoken');

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
    console.log(`[AuthService] Attempting registration for: ${data.email}`);
    if (!data.username) {
      data.username = data.email;
    }

    const existingByUsername = await this.readerRepository.findByUsername(data.username);
    const existingByEmail = await this.readerRepository.findByEmail(data.email);

    if (existingByUsername || existingByEmail) {
      console.log(`[AuthService] Registration failed: Username or email exists (${data.username} / ${data.email})`);
      throw new Error('Username or email already exists');
    }

    const readerData = {
      ...data,
      role: 'reader',
      status: 'active',
      membershipType: data.membershipType || 'basic'
    };

    const reader = await this.readerRepository.create(readerData);
    console.log(`[AuthService] Registration successful: ${reader.username}`);
    const token = this.generateToken(reader);

    return { user: reader, token };
  }

  async login(username, password) {
    console.log(`[AuthService] Attempting login for: ${username}`);
    let user = await this.repository.findByUsername(username);
    let userType = 'staff';

    if (!user) {
      user = await this.repository.findByEmail(username);
    }

    if (!user) {
      user = await this.readerRepository.findByUsername(username);
      userType = 'reader';
    }

    if (!user) {
      user = await this.readerRepository.findByEmail(username);
      userType = 'reader';
    }

    if (!user) {
      console.log(`[AuthService] User not found: ${username}`);
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    console.log(`[AuthService] User found: ${username} (${userType})`);

    if (user.status !== 'active') {
      console.log(`[AuthService] Account not active: ${username}`);
      const error = new Error('Account is not active');
      error.status = 403;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`[AuthService] Invalid password for: ${username}`);
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    if (userType === 'staff') {
      await this.repository.updateLastLogin(user._id);
    } else {
      await this.readerRepository.updateLastLogin(user._id);
    }

    const token = this.generateToken(user);
    user.password = undefined;

    return { user, token };
  }

  async changePassword(staffId, oldPassword, newPassword) {
    const staff = await this.repository.findById(staffId);
    if (!staff) throw new Error('Staff not found');

    const isPasswordValid = await staff.comparePassword(oldPassword);
    if (!isPasswordValid) throw new Error('Current password is incorrect');

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
}

module.exports = AuthService;
