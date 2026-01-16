class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAll(filter = {}, options = {}) {
    return await this.repository.findAll(filter, options);
  }

  async getById(id, populate = '') {
    const entity = await this.repository.findById(id, populate);
    if (!entity) {
      throw new Error('Entity not found');
    }
    return entity;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async update(id, data) {
    const entity = await this.repository.update(id, data);
    if (!entity) {
      throw new Error('Entity not found');
    }
    return entity;
  }

  async delete(id) {
    const entity = await this.repository.delete(id);
    if (!entity) {
      throw new Error('Entity not found');
    }
    return entity;
  }

  async exists(filter) {
    return await this.repository.exists(filter);
  }
}

module.exports = BaseService;
