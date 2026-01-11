const connectDatabase = require('../../shared/config/database');
const ReaderModel = require('./models/Reader.model');
const ReaderRepository = require('./repositories/Reader.repository');
const ReaderService = require('./services/Reader.service');
const ReaderController = require('./controllers/Reader.controller');
const readerRoutes = require('./routes/reader.routes');

let readerServiceInstance = null;

const initReaderService = async () => {
    if (readerServiceInstance) {
        return readerServiceInstance;
    }

    // Connect to database (Uses same database as Auth for Reader data)
    const connection = await connectDatabase(
        process.env.MONGODB_URI,
        'library_auth'
    );

    const Reader = ReaderModel(connection);
    const readerRepository = new ReaderRepository(Reader);
    const readerService = new ReaderService(readerRepository);
    const readerController = new ReaderController(readerService);

    readerServiceInstance = {
        routes: readerRoutes(readerController),
        service: readerService,
        connection
    };

    return readerServiceInstance;
};

module.exports = initReaderService;
