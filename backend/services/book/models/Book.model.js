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
      enum: [
        'Fiction',
        'Non-Fiction',
        'Science',
        'Technology',
        'History',
        'Biography',
        'Literature',
        'Philosophy',
        'Education',
        'Children',
        'Comic',
        'Reference',
        'Other'
      ]
    },
    language: {
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
      shelf: {
        type: String,
        trim: true
      },
      row: {
        type: String,
        trim: true
      },
      position: {
        type: String,
        trim: true
      }
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    status: {
      type: String,
      enum: ['available', 'unavailable', 'maintenance', 'discontinued'],
      default: 'available'
    },
    tags: [{
      type: String,
      trim: true
    }],
    totalBorrowed: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: false
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ isbn: 1 });
bookSchema.index({ category: 1, status: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ publisher: 1 });
bookSchema.index({ available: 1 });

// Pre-save middleware to validate available quantity
bookSchema.pre('save', function (next) {
  if (this.available > this.quantity) {
    return next(new Error('Available quantity cannot exceed total quantity'));
  }

  // Calculate borrowed count
  this.borrowed = this.quantity - this.available;

  // Set status based on availability
  if (this.available === 0) {
    this.status = 'unavailable';
  } else if (this.status === 'unavailable' && this.available > 0) {
    this.status = 'available';
  }

  next();
});

// Instance method to check if book is available for borrowing
bookSchema.methods.isAvailableForBorrow = function () {
  return this.available > 0 && this.status === 'available';
};

// Instance method to borrow book
bookSchema.methods.borrowBook = function (count = 1) {
  if (this.available < count) {
    throw new Error('Not enough books available');
  }
  this.available -= count;
  this.borrowed += count;
  this.totalBorrowed += count;
  return this.save();
};

// Instance method to return book
bookSchema.methods.returnBook = function (count = 1) {
  if (this.borrowed < count) {
    throw new Error('Invalid return count');
  }
  this.available += count;
  this.borrowed -= count;
  return this.save();
};

// Static method to find available books
bookSchema.statics.findAvailable = function (filter = {}) {
  return this.find({ ...filter, available: { $gt: 0 }, status: 'available' });
};

// Static method to search books
bookSchema.statics.searchBooks = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm }
  }).select({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

module.exports = (connection) => {
  return connection.model('Book', bookSchema);
};
