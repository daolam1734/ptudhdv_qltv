const BaseRepository = require('../utils/BaseRepository');

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
    }).lean();
  }

  async toggleFavorite(readerId, bookId) {
    const reader = await this.model.findById(readerId);
    if (!reader) return null;

    const favoriteIndex = reader.favorites.indexOf(bookId);
    if (favoriteIndex > -1) {
      reader.favorites.splice(favoriteIndex, 1);
    } else {
      reader.favorites.push(bookId);
    }

    await reader.save();
    return {
      favorites: reader.favorites,
      isFavorite: favoriteIndex === -1
    };
  }

  async getFavorites(readerId) {
    const reader = await this.model.findById(readerId)
      .populate('favorites', 'title author coverImage status available')
      .lean();
    return reader ? reader.favorites : [];
  }
}

module.exports = ReaderRepository;
