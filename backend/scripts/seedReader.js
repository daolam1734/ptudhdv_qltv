const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const ReaderSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: 'reader' },
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'expired'], default: 'active' },
  idCard: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  membershipType: { type: String, enum: ['basic', 'premium', 'vip'], default: 'basic' },
  membershipExpiry: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  createdAt: { type: Date, default: Date.now }
});

ReaderSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const seedReader = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'library_auth'
    });

    console.log('Connected to MongoDB');

    const Reader = mongoose.model('Reader', ReaderSchema);

    // Check if reader exists
    const existingReader = await Reader.findOne({ username: 'reader1' });
    if (existingReader) {
      console.log('❌ Reader user already exists');
      process.exit(0);
    }

    // Create reader account
    const readerUser = new Reader({
      username: 'reader1',
      email: 'reader1@example.com',
      password: 'password123',
      fullName: 'Nguyễn Văn Độc Giả',
      phone: '0987654321',
      idCard: '123456789',
      dateOfBirth: new Date('1995-01-01'),
      status: 'active',
      membershipType: 'basic'
    });

    await readerUser.save();
    console.log('✅ Reader user created successfully!');
    console.log('   Username: reader1');
    console.log('   Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding reader:', error);
    process.exit(1);
  }
};

seedReader();
