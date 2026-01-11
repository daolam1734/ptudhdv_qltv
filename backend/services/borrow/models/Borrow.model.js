const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
    {
        readerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reader',
            required: true
        },
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true
        },
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff',
            required: true
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
            enum: ['borrowed', 'returned', 'overdue', 'lost'],
            default: 'borrowed'
        },
        fine: {
            amount: { type: Number, default: 0 },
            reason: String,
            isPaid: { type: Boolean, default: false }
        },
        notes: String
    },
    {
        timestamps: true
    }
);

borrowSchema.index({ readerId: 1 });
borrowSchema.index({ bookId: 1 });
borrowSchema.index({ status: 1 });

module.exports = (connection) => {
    return connection.model('Borrow', borrowSchema);
};
