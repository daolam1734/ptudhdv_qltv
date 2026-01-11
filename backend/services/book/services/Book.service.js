const BaseService = require('../../../shared/base/BaseService');

class BookService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async getAllBooks(filter = {}, options = {}) {
    const { category, status, language, author, publisher, available } = filter;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (language) query.language = language;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (publisher) query.publisher = { $regex: publisher, $options: 'i' };
    if (available !== undefined) {
      query.available = available === 'true' ? { $gt: 0 } : 0;
    }

    const populateOptions = {
      ...options,
      populate: 'addedBy lastUpdatedBy'
    };

    return await this.repository.findAll(query, populateOptions);
  }

  async getBookById(id) {
    const book = await this.repository.findById(id, 'addedBy lastUpdatedBy');
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  async createBook(data, staffId) {
    // Check if ISBN already exists
    const existingBook = await this.repository.findByISBN(data.isbn);
    if (existingBook) {
      throw new Error('Book with this ISBN already exists');
    }

    // Set available equal to quantity for new books
    if (!data.available) {
      data.available = data.quantity;
    }

    // Add staff reference
    data.addedBy = staffId;
    data.lastUpdatedBy = staffId;

    return await this.repository.create(data);
  }

  async updateBook(id, data, staffId) {
    // Don't allow ISBN update
    delete data.isbn;

    // Update last updated by
    data.lastUpdatedBy = staffId;

    const book = await this.repository.update(id, data);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  async deleteBook(id) {
    const book = await this.repository.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }

    // Check if book has borrowed copies
    if (book.borrowed > 0) {
      throw new Error('Cannot delete book with borrowed copies. Please wait for all copies to be returned');
    }

    return await this.repository.delete(id);
  }

  async searchBooks(searchTerm, options = {}) {
    if (!searchTerm || searchTerm.trim() === '') {
      throw new Error('Search term is required');
    }
    return await this.repository.searchBooks(searchTerm, options);
  }

  async getAvailableBooks(filter = {}, options = {}) {
    return await this.repository.findAvailableBooks(filter, options);
  }

  async getBooksByCategory(category, options = {}) {
    return await this.repository.findByCategory(category, options);
  }

  async getBooksByAuthor(author, options = {}) {
    return await this.repository.findByAuthor(author, options);
  }

  async getBooksByPublisher(publisher, options = {}) {
    return await this.repository.findByPublisher(publisher, options);
  }

  async updateQuantity(id, quantity) {
    const book = await this.repository.findById(id);
    if (!book) {
      throw new Error('Book not found');
    }

    if (quantity < book.borrowed) {
      throw new Error(`Cannot set quantity to ${quantity}. Currently ${book.borrowed} copies are borrowed`);
    }

    const available = quantity - book.borrowed;
    return await this.repository.updateQuantity(id, quantity, available);
  }

  async getStatistics() {
    return await this.repository.getStatistics();
  }

  async getMostBorrowedBooks(limit = 10) {
    return await this.repository.getMostBorrowed(limit);
  }

  async getNewArrivals(limit = 10) {
    return await this.repository.getNewArrivals(limit);
  }

  async checkAvailability(id) {
    const book = await this.getBookById(id);
    return {
      isbn: book.isbn,
      title: book.title,
      quantity: book.quantity,
      available: book.available,
      borrowed: book.borrowed,
      isAvailable: book.isAvailableForBorrow(),
      status: book.status
    };
  }
}

module.exports = BookService;
