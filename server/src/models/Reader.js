const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const readerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [50, 'Username cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return v === '' || /^[0-9]{10,11}$/.test(v);
        },
        message: 'Please provide a valid phone number'
      }
    },
    role: {
      type: String,
      default: 'reader',
      immutable: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'expired'],
      default: 'active'
    },
    avatar: {
      type: String,
      default: null
    },
    address: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: Date
    },
    idCard: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    membershipType: {
      type: String,
      enum: ['basic', 'premium', 'vip'],
      default: 'basic'
    },
    membershipExpiry: {
      type: Date,
      required: true,
      default: function () {
        // Default: 1 year from now
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }
    },
    borrowLimit: {
      type: Number,
      default: 5
    },
    currentBorrowCount: {
      type: Number,
      default: 0
    },
    totalBorrowed: {
      type: Number,
      default: 0
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    }],
    unpaidViolations: {
      type: Number,
      default: 0
    },
    overdueCount: {
      type: Number,
      default: 0
    },
    suspendedUntil: Date,
    lastLogin: Date,
    registrationDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
readerSchema.index({ email: 1 });
readerSchema.index({ username: 1 });
readerSchema.index({ idCard: 1 });

// Hash password before saving
readerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
readerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if membership is valid
readerSchema.methods.isMembershipValid = function () {
  return this.membershipExpiry > new Date() && this.status === 'active';
};

// Hide sensitive fields
readerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Reader', readerSchema);
