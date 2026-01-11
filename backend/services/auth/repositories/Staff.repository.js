const BaseRepository = require('../../../shared/base/BaseRepository');

class StaffRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async findByUsername(username) {
    return await this.model.findOne({ username }).select('+password');
  }

  async findByEmail(email) {
    return await this.model.findOne({ email }).select('+password');
  }

  async updateLastLogin(id) {
    return await this.model.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  async changePassword(id, newPassword) {
    const staff = await this.model.findById(id);
    if (!staff) return null;

    staff.password = newPassword;
    await staff.save();
    return staff;
  }
}

module.exports = StaffRepository;
