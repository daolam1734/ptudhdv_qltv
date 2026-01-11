const BaseRepository = require('../../../shared/base/BaseRepository');

class BookRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async findByISBN(isbn) {
    return await this.model.findOne({ isbn });
  }

  async findAvailableBooks(filter = {}, options = {}) {
    const query = {
      ...filter,
      available: { $gt: 0 },
      status: 'available'
    };
    return await this.findAll(query, options);
  }

  async searchBooks(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const books = await this.model
      .find({ $text: { $search: searchTerm } })
      .select({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('addedBy', 'fullName username')
      .populate('lastUpdatedBy', 'fullName username');

    const total = await this.model.countDocuments({
      $text: { $search: searchTerm }
    });

    return {
      data: books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findByCategory(category, options = {}) {
    return await this.findAll({ category }, options);
  }

  async findByAuthor(author, options = {}) {
    return await this.findAll({
      author: { $regex: author, $options: 'i' }
    }, options);
  }

  async findByPublisher(publisher, options = {}) {
    return await this.findAll({
      publisher: { $regex: publisher, $options: 'i' }
    }, options);
  }

  async updateQuantity(id, quantity, available) {
    return await this.model.findByIdAndUpdate(
      id,
      { quantity, available },
      { new: true, runValidators: true }
    );
  }

  async borrowBook(id, count = 1) {
    const book = await this.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }
    return await book.borrowBook(count);
  }

  async returnBook(id, count = 1) {
    const book = await this.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }
    return await book.returnBook(count);
  }

  async getStatistics() {
    const stats = await this.model.aggregate([
      {
        $group: {
          _id: null,
          totalBooks: { $sum: '$quantity' },
          availableBooks: { $sum: '$available' },
          borrowedBooks: { $sum: '$borrowed' },
          totalTitles: { $sum: 1 }
        }
      }
    ]);

    const byCategory = await this.model.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          available: { $sum: '$available' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      overall: stats[0] || {
        totalBooks: 0,
        availableBooks: 0,
        borrowedBooks: 0,
        totalTitles: 0
      },
      byCategory
    };
  }

  async getMostBorrowed(limit = 10) {
    return await this.model
      .find()
      .sort({ totalBorrowed: -1 })
      .limit(limit)
      .populate('addedBy', 'fullName username');
  }

  async getNewArrivals(limit = 10) {
    return await this.model
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('addedBy', 'fullName username');
  }
}

module.exports = BookRepository;
