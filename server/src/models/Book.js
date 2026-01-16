const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      match: [/^(?:\d{10}|\d{13})$/, 'Please provide a valid ISBN (10 or 13 digits)']
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    publisher: {
      type: String,
      required: [true, 'Publisher is required'],
      trim: true,
      maxlength: [100, 'Publisher name cannot exceed 100 characters']
    },
    publishYear: {
      type: Number,
      required: [true, 'Publish year is required'],
      min: [1800, 'Publish year must be after 1800'],
      max: [new Date().getFullYear() + 1, 'Publish year cannot be in the future']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    lang: {
      type: String,
      required: [true, 'Language is required'],
      enum: ['Vietnamese', 'English', 'French', 'Chinese', 'Japanese', 'Korean', 'Other'],
      default: 'Vietnamese'
    },
    pages: {
      type: Number,
      required: [true, 'Number of pages is required'],
      min: [1, 'Pages must be at least 1']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    coverImage: {
      type: String,
      default: null
    },
    price: {
      type: Number,
      required: [true, 'Book price is required'],
      min: [0, 'Price cannot be negative'],
      default: 50000
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    available: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative'],
      default: 0
    },
    borrowed: {
      type: Number,
      default: 0,
      min: [0, 'Borrowed count cannot be negative']
    },
    location: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['available', 'unavailable', 'maintenance', 'discontinued'],
      default: 'available'
    },
    tags: [{ type: String, trim: true }],
    totalBorrowed: {
      type: Number,
      default: 0
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
bookSchema.index({ title: 'text', author: 'text', category: 'text', tags: 'text' });
bookSchema.index({ isbn: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ status: 1 });

// Query middleware to exclude deleted books
bookSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Indexes for search
bookSchema.index({ 
  title: 'text', 
  author: 'text', 
  category: 'text',
  isbn: 'text'
}, {
  weights: {
    title: 10,
    author: 5,
    category: 3,
    isbn: 2
  },
  name: 'BookTextIndex'
});

// Virtual for checking availability
bookSchema.virtual('isAvailable').get(function () {
  return this.available > 0 && this.status === 'available';
});

// Instance methods for quantity management
bookSchema.methods.borrowBook = async function (count = 1) {
  if (this.available < count) {
    throw new Error('Not enough books available');
  }
  this.available -= count;
  this.borrowed += count;
  this.totalBorrowed += count;
  return await this.save();
};

bookSchema.methods.returnBook = async function (count = 1) {
  this.available += count;
  this.borrowed -= count;
  return await this.save();
};

module.exports = mongoose.model('Book', bookSchema);
