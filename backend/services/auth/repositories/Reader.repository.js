const BaseRepository = require('../../../shared/base/BaseRepository');

class ReaderRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async findByUsername(username) {
    return await this.model.findOne({ username }).select('+password');
  }

  async findByEmail(email) {
    return await this.model.findOne({ email }).select('+password');
  }

  async findByIdCard(idCard) {
    return await this.model.findOne({ idCard });
  }

  async updateLastLogin(id) {
    return await this.model.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      { new: true }
    );
  }

  async incrementBorrowCount(id) {
    return await this.model.findByIdAndUpdate(
      id,
      {
        $inc: { currentBorrowCount: 1, totalBorrowed: 1 }
      },
      { new: true }
    );
  }

  async decrementBorrowCount(id) {
    return await this.model.findByIdAndUpdate(
      id,
      {
        $inc: { currentBorrowCount: -1 }
      },
      { new: true }
    );
  }

  async updateMembership(id, membershipType, expiryDate) {
    return await this.model.findByIdAndUpdate(
      id,
      {
        membershipType,
        membershipExpiry: expiryDate,
        status: 'active'
      },
      { new: true }
    );
  }

  async getExpiredReaders() {
    return await this.model.find({
      membershipExpiry: { $lt: new Date() },
      status: 'active'
    });
  }
}

module.exports = ReaderRepository;
