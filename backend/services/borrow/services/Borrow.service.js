const BaseService = require('../../../shared/base/BaseService');
const { BORROW } = require('../../../config/constants');

class BorrowService extends BaseService {
    constructor(repository, bookService, readerService) {
        super(repository);
        this.bookService = bookService;
        this.readerService = readerService;
    }

    async borrowBook(data) {
        const { readerId, bookId, staffId, durationDays = BORROW.DEFAULT_DURATION_DAYS } = data;

        // 1. Check Reader eligibility
        const reader = await this.readerService.getById(readerId);
        if (!reader) throw new Error('Reader not found');
        if (reader.status !== 'active') throw new Error('Reader account is not active');
        if (reader.currentBorrowCount >= reader.borrowLimit) {
            throw new Error(`Reader has reached the borrow limit of ${reader.borrowLimit} books`);
        }

        // 2. Check Book availability
        const book = await this.bookService.getById(bookId);
        if (!book) throw new Error('Book not found');
        if (book.available <= 0) throw new Error('Book is currently out of stock');

        // 3. Calculate due date
        const borrowDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(borrowDate.getDate() + durationDays);

        // 4. Create borrow record
        const borrowRecord = await this.repository.create({
            readerId,
            bookId,
            staffId,
            borrowDate,
            dueDate,
            status: 'borrowed'
        });

        // 5. Update Book stock
        await this.bookService.update(bookId, {
            available: book.available - 1,
            borrowed: book.borrowed + 1
        });

        // 6. Update Reader count
        await this.readerService.update(readerId, {
            currentBorrowCount: reader.currentBorrowCount + 1,
            totalBorrowed: reader.totalBorrowed + 1
        });

        return borrowRecord;
    }

    async returnBook(borrowId, staffId, notes = '') {
        const record = await this.repository.findById(borrowId);
        if (!record) throw new Error('Borrow record not found');
        if (record.status === 'returned') throw new Error('Book already returned');

        const returnDate = new Date();
        let status = 'returned';
        let fineAmount = 0;

        // Calculate fine if overdue
        if (returnDate > record.dueDate) {
            const diffTime = Math.abs(returnDate - record.dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            fineAmount = diffDays * BORROW.FINE_PER_DAY;
        }

        // 1. Update Record
        const updatedRecord = await this.repository.update(borrowId, {
            returnDate,
            status,
            notes: notes || record.notes,
            'fine.amount': fineAmount,
            'fine.reason': fineAmount > 0 ? 'Overdue return' : ''
        });

        // 2. Update Book stock
        const book = await this.bookService.getById(record.bookId);
        await this.bookService.update(record.bookId, {
            available: book.available + 1,
            borrowed: book.borrowed - 1
        });

        // 3. Update Reader count
        const reader = await this.readerService.getById(record.readerId);
        await this.readerService.update(record.readerId, {
            currentBorrowCount: Math.max(0, reader.currentBorrowCount - 1)
        });

        return updatedRecord;
    }

    async getReaderHistory(readerId) {
        return await this.repository.findAll({ readerId }, { sort: { createdAt: -1 } });
    }
}

module.exports = BorrowService;
