const BaseService = require('../utils/BaseService');

class ReaderService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async getAllReaders(filter = {}, options = {}) {
    const { status, membershipType, search, hasDebt } = filter;

    const query = {};
    if (status) query.status = status;
    if (membershipType) query.membershipType = membershipType;
    if (hasDebt === 'true' || hasDebt === true) {
      query.unpaidViolations = { $gt: 0 };
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { idCard: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (!options.select) {
      // Exclude large or sensitive fields for list view
      options.select = '-address -favorites -lastLogin -password';
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

  async updateUnpaidViolations(id, amount) {
    const reader = await this.repository.findById(id);
    if (!reader) throw new Error('Reader not found');
    
    const newDebt = (reader.unpaidViolations || 0) + amount;
    const updatedReader = await this.repository.update(id, {
      unpaidViolations: Math.max(0, newDebt)
    });

    // Tự động mở khóa tài khoản nếu trả hết nợ và không có sách quá hạn (check sơ bộ)
    // Lưu ý: Việc kiểm tra sách quá hạn triệt để sẽ thực hiện ở BorrowService
    if (updatedReader.unpaidViolations <= 0 && updatedReader.status === 'suspended') {
      // Chúng ta sẽ cần một phương thức kiểm tra xem còn sách quá hạn không
      // Ở đây tạm thời để cập nhật trạng thái nếu muốn tự động hóa cao
    }

    return updatedReader;
  }

  async toggleFavorite(readerId, bookId) {
    return await this.repository.toggleFavorite(readerId, bookId);
  }

  async getFavorites(readerId) {
    return await this.repository.getFavorites(readerId);
  }

  async getBasket(readerId) {
    return await this.repository.getBasket(readerId);
  }

  async updateBasket(readerId, basketData) {
    return await this.repository.updateBasket(readerId, basketData);
  }

  async clearBasket(readerId) {
    return await this.repository.clearBasket(readerId);
  }
}

module.exports = ReaderService;
