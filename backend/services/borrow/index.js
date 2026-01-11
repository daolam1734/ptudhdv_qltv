const connectDatabase = require('../../shared/config/database');
const BorrowModel = require('./models/Borrow.model');
const BorrowRepository = require('./repositories/Borrow.repository');
const BorrowService = require('./services/Borrow.service');
const BorrowController = require('./controllers/Borrow.controller');
const borrowRoutes = require('./routes/borrow.routes');

let borrowServiceInstance = null;

const initBorrowService = async (bookService, readerService) => {
    if (borrowServiceInstance) {
        return borrowServiceInstance;
    }

    // Connect to database
    const connection = await connectDatabase(
        process.env.MONGODB_URI,
        'library_borrow'
    );

    const Borrow = BorrowModel(connection);
    const borrowRepository = new BorrowRepository(Borrow);
    const borrowService = new BorrowService(borrowRepository, bookService, readerService);
    const borrowController = new BorrowController(borrowService);

    borrowServiceInstance = {
        routes: borrowRoutes(borrowController),
        service: borrowService,
        connection
    };

    return borrowServiceInstance;
};

module.exports = initBorrowService;
