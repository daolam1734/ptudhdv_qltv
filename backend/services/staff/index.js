const connectDatabase = require('../../shared/config/database');
const StaffModel = require('./models/Staff.model');
const StaffRepository = require('./repositories/Staff.repository');
const StaffService = require('./services/Staff.service');
const StaffController = require('./controllers/Staff.controller');
const staffRoutes = require('./routes/staff.routes');

let staffServiceInstance = null;

const initStaffService = async () => {
    if (staffServiceInstance) {
        return staffServiceInstance;
    }

    // Connect to database (Uses same database as Auth for Staff data)
    const connection = await connectDatabase(
        process.env.MONGODB_URI,
        'library_auth'
    );

    const Staff = StaffModel(connection);
    const staffRepository = new StaffRepository(Staff);
    const staffService = new StaffService(staffRepository);
    const staffController = new StaffController(staffService);

    staffServiceInstance = {
        routes: staffRoutes(staffController),
        service: staffService,
        connection
    };

    return staffServiceInstance;
};

module.exports = initStaffService;
