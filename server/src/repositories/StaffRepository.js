const BaseRepository = require('../utils/BaseRepository');

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
}

module.exports = StaffRepository;
