const mongoose = require('mongoose');
const Book = require('./server/src/models/Book');
const connectDatabase = require('./server/src/config/db');
require('dotenv').config({ path: './server/.env' });

const booksData = [
  {
    title: "Lão Hạc",
    author: "Nam Cao",
    isbn: "9786049876543",
    category: "Văn học",
    lang: "Vietnamese",
    description: "Tác phẩm phản ánh số phận bi thương của người nông dân nghèo trước Cách mạng, thể hiện sâu sắc giá trị nhân đạo và hiện thực.",
    quantity: 30,
    available: 30,
    publishYear: 2021,
    location: { shelf: "A1", row: "02" },
    publisher: "NXB Văn Học",
    pages: 150
  },
  {
    title: "Tắt Đèn",
    author: "Ngô Tất Tố",
    isbn: "9786041234567",
    category: "Văn học",
    lang: "Vietnamese",
    description: "Phản ánh cuộc sống khổ cực của người nông dân dưới ách thống trị phong kiến, nổi bật hình ảnh người phụ nữ giàu đức hi sinh.",
    quantity: 42,
    available: 42,
    publishYear: 2020,
    location: { shelf: "A1", row: "03" },
    publisher: "NXB Văn Học",
    pages: 200
  },
  {
    title: "Tuổi Thơ Dữ Dội",
    author: "Phùng Quán",
    isbn: "9786049988776",
    category: "Lịch sử",
    lang: "Vietnamese",
    description: "Tác phẩm viết về tuổi thơ anh dũng của thiếu niên Việt Nam trong kháng chiến, giàu cảm xúc và tinh thần yêu nước.",
    quantity: 25,
    available: 25,
    publishYear: 2019,
    location: { shelf: "B1", row: "01" },
    publisher: "NXB Kim Đồng",
    pages: 800
  },
  {
    title: "Số Đỏ",
    author: "Vũ Trọng Phụng",
    isbn: "9786043344556",
    category: "Văn học",
    lang: "Vietnamese",
    description: "Tác phẩm trào phúng nổi tiếng, phê phán xã hội đương thời với giọng văn sắc sảo và hài hước.",
    quantity: 38,
    available: 38,
    publishYear: 2022,
    location: { shelf: "A1", row: "04" },
    publisher: "NXB Văn Học",
    pages: 250
  },
  {
    title: "Nhật Ký Trong Tù",
    author: "Hồ Chí Minh",
    isbn: "9786041122334",
    category: "Triết học",
    lang: "Vietnamese",
    description: "Tập thơ ghi lại tinh thần lạc quan, ý chí kiên cường của tác giả trong hoàn cảnh lao tù gian khổ.",
    quantity: 20,
    available: 20,
    publishYear: 2018,
    location: { shelf: "B2", row: "01" },
    publisher: "NXB Chính Trị Quốc Gia",
    pages: 120
  },
  {
    title: "Đất Rừng Phương Nam",
    author: "Đoàn Giỏi",
    isbn: "9786045566778",
    category: "Giáo dục",
    lang: "Vietnamese",
    description: "Tác phẩm miêu tả thiên nhiên và con người Nam Bộ, gắn với hành trình trưởng thành của nhân vật chính.",
    quantity: 33,
    available: 33,
    publishYear: 2021,
    location: { shelf: "A2", row: "01" },
    publisher: "NXB Kim Đồng",
    pages: 300
  },
  {
    title: "Không Gia Đình",
    author: "Hector Malot",
    isbn: "9786048899001",
    category: "Giáo dục",
    lang: "Vietnamese",
    description: "Câu chuyện cảm động về hành trình tìm kiếm gia đình và hạnh phúc của cậu bé Rémi.",
    quantity: 27,
    available: 27,
    publishYear: 2020,
    location: { shelf: "A2", row: "02" },
    publisher: "NXB Văn Học",
    pages: 500
  },
  {
    title: "Harry Potter và Hòn Đá Phù Thủy",
    author: "J.K. Rowling",
    isbn: "9780747532699",
    category: "Văn học hư cấu",
    lang: "Vietnamese",
    description: "Phần mở đầu của loạt truyện giả tưởng nổi tiếng, kể về hành trình khám phá thế giới phép thuật của Harry Potter.",
    quantity: 60,
    available: 60,
    publishYear: 2022,
    location: { shelf: "C1", row: "01" },
    publisher: "NXB Trẻ",
    pages: 450
  },
  {
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    isbn: "9780061122415",
    category: "Triết học",
    lang: "Vietnamese",
    description: "Câu chuyện truyền cảm hứng về hành trình theo đuổi ước mơ và khám phá giá trị bản thân.",
    quantity: 45,
    available: 45,
    publishYear: 2021,
    location: { shelf: "C2", row: "01" },
    publisher: "NXB Văn Học",
    pages: 220
  }
];

const seedBooks = async () => {
  try {
    await connectDatabase();
    console.log('Clearing old books...');
    // We don't want to clear all books, just add new ones if they don't exist
    for (const book of booksData) {
      const existingBook = await Book.findOne({ isbn: book.isbn });
      if (!existingBook) {
        await Book.create(book);
        console.log(`✅ Added: ${book.title}`);
      } else {
        console.log(`ℹ️ Skipped: ${book.title} (Already exists)`);
      }
    }
    console.log('Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedBooks();
