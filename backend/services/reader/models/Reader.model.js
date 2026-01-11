const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const readerSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            select: false
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true
        },
        role: {
            type: String,
            default: 'reader'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended', 'expired'],
            default: 'active'
        },
        address: {
            street: String,
            city: String,
            district: String,
            ward: String
        },
        dateOfBirth: {
            type: Date,
            required: [true, 'Date of birth is required']
        },
        idCard: {
            type: String,
            required: [true, 'ID card number is required'],
            unique: true,
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
        lastLogin: Date
    },
    {
        timestamps: true
    }
);

readerSchema.index({ username: 1 });
readerSchema.index({ email: 1 });
readerSchema.index({ idCard: 1 });

// Pre-save to hash if password is changed
readerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports = (connection) => {
    return connection.model('Reader', readerSchema);
};
