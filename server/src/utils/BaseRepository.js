class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, populate = '' } = options;
    const skip = (page - 1) * limit;

    let query = this.model.find(filter);

    if (populate) {
      query = query.populate(populate);
    }

    const data = await query
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.model.countDocuments(filter);

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalItems: total,
        pages: Math.ceil(total / limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id, populate = '') {
    let query = this.model.findById(id);
    if (populate) {
      query = query.populate(populate);
    }
    return await query.exec();
  }

  async findOne(filter, populate = '') {
    let query = this.model.findOne(filter);
    if (populate) {
      query = query.populate(populate);
    }
    return await query.exec();
  }

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  async exists(filter) {
    return await this.model.exists(filter);
  }
}

module.exports = BaseRepository;
