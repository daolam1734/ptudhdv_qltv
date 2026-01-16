const BaseService = require('../utils/BaseService');
const mongoose = require('mongoose');

class CategoryService extends BaseService {
  constructor(categoryRepository) {
    super(categoryRepository);
  }

  async getAllCategories(params) {
    const { page = 1, limit = 10, name, isActive } = params;
    const filter = {};
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Use aggregation to get counts accurately and efficiently
    const categories = await this.repository.model.aggregate([
      { $match: filter },
      { $sort: { name: 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'books'
        }
      },
      {
        $addFields: {
          bookCount: { $size: '$books' }
        }
      },
      {
        $project: {
          books: 0 // Remove the books array to save bandwidth
        }
      }
    ]);

    const total = await this.repository.model.countDocuments(filter);

    return {
      data: categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async delete(id) {
    const Book = mongoose.model('Book');
    const bookCount = await Book.countDocuments({ categoryId: id });
    
    if (bookCount > 0) {
      const error = new Error(`Không thể xóa danh mục này vì vẫn còn ${bookCount} cuốn sách thuộc danh mục này.`);
      error.status = 400;
      throw error;
    }
    
    return await this.repository.delete(id);
  }
}

module.exports = CategoryService;
