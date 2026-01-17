const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
    {
        readerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reader',
            required: true
        },
        books: [{
            bookId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Book',
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'approved', 'borrowed', 'returned', 'overdue', 'lost', 'damaged', 'damaged_heavy', 'rejected', 'cancelled', 'đang chờ', 'đã duyệt', 'đang mượn', 'đã trả', 'đã trả (vi phạm)', 'quá hạn', 'làm mất', 'hư hỏng', 'hư hỏng nặng', 'từ chối', 'đã hủy'],
                default: 'đang chờ'
            },
            returnDate: Date,
            renewalCount: {
                type: Number,
                default: 0
            },
            violation: {
                amount: { type: Number, default: 0 },
                reason: String,
                isPaid: { type: Boolean, default: false },
                paidAt: Date
            }
        }],
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        },
        borrowDate: {
            type: Date,
            default: Date.now
        },
        dueDate: {
            type: Date,
            required: true
        },
        returnDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'borrowed', 'returned', 'overdue', 'lost', 'damaged', 'damaged_heavy', 'rejected', 'cancelled', 'đang chờ', 'đã duyệt', 'đang mượn', 'đã trả', 'đã trả (vi phạm)', 'quá hạn', 'làm mất', 'hư hỏng', 'hư hỏng nặng', 'từ chối', 'đã hủy'],
            default: 'đang chờ'
        },
        renewalCount: {
            type: Number,
            default: 0
        },
        maxRenewals: {
            type: Number,
            default: 2
        },
        violation: {
            amount: { type: Number, default: 0 },
            reason: String,
            isPaid: { type: Boolean, default: false },
            paidAt: Date
        },
        borrowSessionId: {
            type: String,
            index: true
        },
        notes: String
    },
    {
        timestamps: true
    }
);

borrowSchema.index({ readerId: 1 });
borrowSchema.index({ 'books.bookId': 1 });
borrowSchema.index({ status: 1 });

module.exports = mongoose.model('Borrow', borrowSchema);
