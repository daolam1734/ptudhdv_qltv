const BaseService = require('../utils/BaseService');

class StaffService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async getAllStaff(filter = {}, options = {}) {
    const { role, status, search } = filter;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    return await this.repository.findAll(query, options);
  }

  async createStaff(data) {
    const existingStaff = await this.repository.findOne({
      $or: [{ username: data.username }, { email: data.email }]
    });

    if (existingStaff) {
      throw new Error('Username or email already exists');
    }

    return await this.repository.create(data);
  }

  async updateStaff(id, data) {
    const bcrypt = require('bcryptjs');
    delete data.username;

    if (data.password && data.password.trim() !== "") {
      data.password = await bcrypt.hash(data.password, 12);
    } else {
      delete data.password;
    }

    const staff = await this.repository.update(id, data);
    if (!staff) throw new Error('Staff member not found');
    return staff;
  }

  async deleteStaff(id) {
    const staff = await this.repository.findById(id);
    if (!staff) throw new Error('Staff member not found');
    
    // Check if it's the only admin
    if (staff.role === 'admin') {
      const adminCount = await this.repository.model.countDocuments({ role: 'admin', _id: { $ne: id } });
      if (adminCount === 0) {
        throw new Error('Cannot delete the last admin member');
      }
    }

    return await this.repository.update(id, { status: 'inactive' });
  }
}

module.exports = StaffService;
