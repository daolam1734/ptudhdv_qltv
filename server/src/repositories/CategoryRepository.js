const BaseRepository = require('../utils/BaseRepository');
const Category = require('../models/Category');

class CategoryRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }
}

module.exports = CategoryRepository;
