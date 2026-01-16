const BaseService = require('../utils/BaseService');
const categoryRepository = require('../repositories/CategoryRepository');

class CategoryService extends BaseService {
  constructor(categoryRepository) {
    super(categoryRepository);
  }

  async getAllCategories(params) {
    const { page, limit, name, isActive } = params;
    const filter = {};
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    return await this.repository.findAll(filter, { 
      page, 
      limit,
      sort: { name: 1 } 
    });
  }
}

module.exports = CategoryService;
