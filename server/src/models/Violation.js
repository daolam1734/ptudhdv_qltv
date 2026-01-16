const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema(
    {
        readerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reader',
            required: true
        },
        borrowId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Borrow'
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        reason: {
            type: String,
            required: true,
            enum: ['overdue', 'lost_book', 'damaged_book', 'other']
        },
        description: String,
        status: {
            type: String,
            enum: ['unpaid', 'paid', 'cancelled'],
            default: 'unpaid'
        },
        paidAt: Date,
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        }
    },
    {
        timestamps: true
    }
);

violationSchema.index({ readerId: 1, status: 1 });
violationSchema.index({ borrowId: 1 });

module.exports = mongoose.model('Violation', violationSchema);
