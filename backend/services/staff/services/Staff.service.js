const BaseService = require('../../../shared/base/BaseService');

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
    // Check if username or email already exists
    const existingStaff = await this.repository.findOne({
      $or: [{ username: data.username }, { email: data.email }]
    });

    if (existingStaff) {
      throw new Error('Username or email already exists');
    }

    return await this.repository.create(data);
  }

  async updateStaff(id, data) {
    // Prevent sensitive fields from being updated directly here if needed
    delete data.password;
    delete data.username;

    const staff = await this.repository.update(id, data);
    if (!staff) {
      throw new Error('Staff member not found');
    }
    return staff;
  }

  async deleteStaff(id) {
    const staff = await this.repository.findById(id);
    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Optional: Add logic to prevent deleting the last admin
    if (staff.role === 'admin') {
        const adminCount = await this.repository.count({ role: 'admin' });
        if (adminCount <= 1) {
            throw new Error('Cannot delete the last administrator');
        }
    }

    return await this.repository.delete(id);
  }
}

module.exports = StaffService;
