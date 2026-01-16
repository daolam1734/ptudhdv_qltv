const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Staff = require('./src/models/Staff');
const connectDatabase = require('./src/config/db');

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDatabase();
        
        const adminData = {
            username: 'admin',
            password: 'adminpassword',
            email: 'admin@library.com',
            fullName: 'System Administrator',
            role: 'admin',
            status: 'active'
        };

        const existingAdmin = await Staff.findOne({ 
            $or: [{ username: adminData.username }, { email: adminData.email }] 
        });

        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        await Staff.create(adminData);
        console.log('✅ Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: adminpassword');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
