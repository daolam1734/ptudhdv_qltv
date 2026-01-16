const BaseService = require('../utils/BaseService');

class ReaderService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async getAllReaders(filter = {}, options = {}) {
    const { status, membershipType, search } = filter;

    const query = {};
    if (status) query.status = status;
    if (membershipType) query.membershipType = membershipType;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { idCard: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    return await this.repository.findAll(query, options);
  }

  async updateReader(id, data) {
    const bcrypt = require('bcryptjs');
    
    // Don't allow changing role or username
    delete data.role;
    delete data.username;

    // Handle password update if provided
    if (data.password && data.password.trim() !== "") {
      data.password = await bcrypt.hash(data.password, 12);
    } else {
      delete data.password;
    }

    const reader = await this.repository.update(id, data);
    if (!reader) throw new Error('Reader not found');
    return reader;
  }

  async create(data) {
    // Check if username already exists
    const existingUsername = await this.repository.findOne({ username: data.username });
    if (existingUsername) throw new Error('Username already exists');

    // Check if email already exists
    const existingEmail = await this.repository.findOne({ email: data.email });
    if (existingEmail) throw new Error('Email already exists');

    return await this.repository.create(data);
  }

  async updateUnpaidFines(id, amount) {
    const reader = await this.repository.findById(id);
    if (!reader) throw new Error('Reader not found');
    
    return await this.repository.update(id, {
      unpaidFines: (reader.unpaidFines || 0) + amount
    });
  }

  async toggleFavorite(readerId, bookId) {
    return await this.repository.toggleFavorite(readerId, bookId);
  }

  async getFavorites(readerId) {
    return await this.repository.getFavorites(readerId);
  }
}

module.exports = ReaderService;
