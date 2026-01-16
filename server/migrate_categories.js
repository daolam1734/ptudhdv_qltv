const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Book = require('./src/models/Book');
const connectDatabase = require('./src/config/db');

const categoryMap = {
  'Literature': 'Văn học',
  'History': 'Lịch sử',
  'Politics': 'Phi hư cấu',
  'Education': 'Giáo dục',
  'Philosophy': 'Triết học',
  'Fantasy': 'Văn học hư cấu',
  'Science': 'Khoa học',
  'Technology': 'Công nghệ',
  'Biography': 'Tiểu sử',
  'Children': 'Thiếu nhi',
  'Comics': 'Truyện tranh',
  'Reference': 'Sách tham khảo',
  'Other': 'Khác'
};

const updateCategories = async () => {
  try {
    await connectDatabase();
    console.log('Connected to database');

    const books = await Book.find({});
    console.log(`Found ${books.length} books`);

    let updatedCount = 0;
    for (const book of books) {
      const updateData = {};
      
      // Map category
      if (categoryMap[book.category]) {
        updateData.category = categoryMap[book.category];
      }

      // Fix location if it's not a string (as found in some records)
      if (book.location && typeof book.location !== 'string') {
        const loc = book.location;
        updateData.location = `${loc.shelf || ''}-${loc.row || ''}`.replace(/^-|-$/, '');
      }

      if (Object.keys(updateData).length > 0) {
        await Book.updateOne({ _id: book._id }, { $set: updateData });
        const oldCat = book.category;
        console.log(`Updated book "${book.title}":`);
        if (updateData.category) console.log(`  - Category: ${oldCat} -> ${updateData.category}`);
        if (updateData.location) console.log(`  - Location: Fixed object to string`);
        updatedCount++;
      }
    }

    console.log(`Finished updating ${updatedCount} books`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
};

updateCategories();
