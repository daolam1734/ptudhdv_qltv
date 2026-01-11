const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['electronics', 'clothing', 'books', 'food', 'other'],
      default: 'other'
    },
    inStock: {
      type: Boolean,
      default: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
itemSchema.index({ title: 'text', description: 'text' });
itemSchema.index({ category: 1, price: 1 });
itemSchema.index({ inStock: 1 });

// Virtual field
itemSchema.virtual('totalValue').get(function () {
  return this.price * this.quantity;
});

// Pre-save middleware
itemSchema.pre('save', function (next) {
  this.inStock = this.quantity > 0;
  next();
});

// Instance method
itemSchema.methods.updateStock = function (quantity) {
  this.quantity += quantity;
  this.inStock = this.quantity > 0;
  return this.save();
};

// Static method
itemSchema.statics.findByCategory = function (category) {
  return this.find({ category, inStock: true });
};

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
