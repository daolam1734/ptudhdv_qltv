const BaseRepository = require('../utils/BaseRepository');

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
      isDeleted: { $ne: true }
    };
    return await this.findAll(query, options);
  }

  async searchBooks(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const books = await this.model
      .find({ $text: { $search: searchTerm }, isDeleted: { $ne: true } })
      .select({ score: { $meta: 'textScore' } })
      .populate('categoryId', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.model.countDocuments({
      $text: { $search: searchTerm },
      isDeleted: { $ne: true }
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

  async findByCategoryId(categoryId, options = {}) {
    return await this.findAll({ categoryId }, options);
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

  async getStatistics() {
    const stats = await this.model.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalBooks: { $sum: '$quantity' },
          availableBooks: { $sum: '$available' },
          totalTitles: { $sum: 1 }
        }
      }
    ]);

    const byGenre = await this.model.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          available: { $sum: '$available' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $project: {
          _id: 1,
          name: { $ifNull: [{ $arrayElemAt: ['$categoryInfo.name', 0] }, "Chưa phân loại"] },
          count: 1,
          totalQuantity: 1,
          available: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      overall: stats[0] || {
        totalBooks: 0,
        availableBooks: 0,
        totalTitles: 0
      },
      byGenre
    };
  }

  async getCategories() {
    // 1. Get all defined categories from Category collection
    const Category = require('../models/Category');
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // 2. Get counts from books
    const counts = await this.model.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = counts.reduce((acc, curr) => {
      if (curr._id) {
        acc[curr._id.toString()] = curr.count;
      }
      return acc;
    }, {});

    return categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      count: countMap[cat._id.toString()] || 0
    }));
  }
}

module.exports = BookRepository;
