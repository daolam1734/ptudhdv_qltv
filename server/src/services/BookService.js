const BaseService = require("../utils/BaseService");

class BookService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async getAllBooks(filter = {}, options = {}) {
    const { category, categoryId, status, author, publisher, available } = filter;

    const query = {};
    if (category) query.categoryId = category;
    if (categoryId) query.categoryId = categoryId;
    if (status) query.status = status;
    if (author) query.author = { $regex: author, $options: "i" };
    if (publisher) query.publisher = { $regex: publisher, $options: "i" };
    if (available !== undefined) {
      query.available = available === "true" ? { $gt: 0 } : 0;
    }

    if (!options.populate) {
      options.populate = 'categoryId';
    }

    if (!options.select) {
      // Exclude large fields for list view to improve performance on weak networks
      options.select = '-description -tags -addedBy -lastUpdatedBy';
    }

    return await this.repository.findAll(query, options);
  }

  async getById(id, populate = 'categoryId') {
    return await super.getById(id, populate);
  }

  async createBook(data) {
    const existingBook = await this.repository.findByISBN(data.isbn);
    if (existingBook) {
      throw new Error("Book with this ISBN already exists");
    }

    if (data.available === undefined) {
      data.available = data.quantity;
    }

    return await this.repository.create(data);
  }

  async updateBook(id, data) {
    delete data.isbn; // Don't allow ISBN update
    const book = await this.repository.update(id, data);
    if (!book) throw new Error("Book not found");
    return book;
  }

  async deleteBook(id) {
    const book = await this.repository.findById(id);
    if (!book) throw new Error("Book not found");

    const borrowedCount = book.quantity - book.available;
    if (borrowedCount > 0) {
      throw new Error("Cannot delete book with borrowed copies");
    }

    return await this.repository.update(id, { isDeleted: true });
  }

  async searchBooks(searchTerm, options = {}) {
    if (!searchTerm || searchTerm.trim() === "") {
      throw new Error("Search term is required");
    }
    return await this.repository.searchBooks(searchTerm, options);
  }

  async getStatistics() {
    return await this.repository.getStatistics();
  }

  async getCategories() {
    return await this.repository.getCategories();
  }
}

module.exports = BookService;
