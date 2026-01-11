const connectDatabase = require('../../shared/config/database');
const StaffModel = require('./models/Staff.model');
const ReaderModel = require('./models/Reader.model');
const StaffRepository = require('./repositories/Staff.repository');
const ReaderRepository = require('./repositories/Reader.repository');
const AuthService = require('./services/Auth.service');
const AuthController = require('./controllers/Auth.controller');
const authRoutes = require('./routes/auth.routes');

let authServiceInstance = null;

const initAuthService = async () => {
  if (authServiceInstance) {
    return authServiceInstance;
  }

  // Connect to database
  const connection = await connectDatabase(
    process.env.MONGODB_URI,
    'library_auth'
  );

  // Initialize models
  const Staff = StaffModel(connection);
  const Reader = ReaderModel(connection);

  // Initialize repositories
  const staffRepository = new StaffRepository(Staff);
  const readerRepository = new ReaderRepository(Reader);

  // Initialize service and controller
  const authService = new AuthService(staffRepository, readerRepository);
  const authController = new AuthController(authService);

  authServiceInstance = {
    routes: authRoutes(authController),
    service: authService,
    connection
  };

  return authServiceInstance;
};

module.exports = initAuthService;
