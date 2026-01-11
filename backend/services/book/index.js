const connectDatabase = require('../../shared/config/database');
const BookModel = require('./models/Book.model');
const BookRepository = require('./repositories/Book.repository');
const BookService = require('./services/Book.service');
const BookController = require('./controllers/Book.controller');
const bookRoutes = require('./routes/book.routes');

let bookServiceInstance = null;

const initBookService = async () => {
  if (bookServiceInstance) {
    return bookServiceInstance;
  }

  // Connect to database
  const connection = await connectDatabase(
    process.env.MONGODB_URI,
    'library_books'
  );

  // Initialize model
  const Book = BookModel(connection);

  // Initialize repository
  const bookRepository = new BookRepository(Book);

  // Initialize service and controller
  const bookService = new BookService(bookRepository);
  const bookController = new BookController(bookService);

  bookServiceInstance = {
    routes: bookRoutes(bookController),
    service: bookService,
    connection
  };

  return bookServiceInstance;
};

module.exports = initBookService;
