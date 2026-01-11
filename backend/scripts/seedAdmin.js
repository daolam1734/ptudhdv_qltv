const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const StaffSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'librarian', 'staff'], default: 'staff' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

StaffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'library_auth'
    });

    console.log('Connected to MongoDB');

    const Staff = mongoose.model('Staff', StaffSchema);

    // Check if admin exists
    const existingAdmin = await Staff.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      process.exit(0);
    }

    // Create admin account
    const adminUser = new Staff({
      username: 'admin',
      email: 'admin@library.com',
      password: 'admin123',
      fullName: 'System Administrator',
      role: 'admin',
      status: 'active'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: admin');

    // Create a librarian account
    const librarianUser = new Staff({
      username: 'librarian1',
      email: 'librarian@library.com',
      password: 'librarian123',
      fullName: 'John Librarian',
      role: 'librarian',
      status: 'active'
    });

    await librarianUser.save();
    console.log('✅ Librarian user created successfully!');
    console.log('   Username: librarian1');
    console.log('   Password: librarian123');
    console.log('   Role: librarian');

    // Create a staff account
    const staffUser = new Staff({
      username: 'staff1',
      email: 'staff@library.com',
      password: 'staff123',
      fullName: 'Jane Staff',
      role: 'staff',
      status: 'active'
    });

    await staffUser.save();
    console.log('✅ Staff user created successfully!');
    console.log('   Username: staff1');
    console.log('   Password: staff123');
    console.log('   Role: staff');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
