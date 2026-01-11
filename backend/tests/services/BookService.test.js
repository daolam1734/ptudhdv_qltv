const BookService = require('../../services/book/services/Book.service');

describe('BookService', () => {
  let bookService;
  let mockBookRepo;

  beforeEach(() => {
    mockBookRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByISBN: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    bookService = new BookService(mockBookRepo);
  });

  describe('createBook', () => {
    it('should throw error if book with ISBN already exists', async () => {
      mockBookRepo.findByISBN.mockResolvedValue({ title: 'Existing' });
      await expect(bookService.createBook({ isbn: '1234567890' }, 'staff1')).rejects.toThrow('Book with this ISBN already exists');
    });

    it('should create a book if ISBN is new', async () => {
      mockBookRepo.findByISBN.mockResolvedValue(null);
      const mockData = { title: 'New Book', isbn: '1234567890', quantity: 5 };
      mockBookRepo.create.mockResolvedValue({ ...mockData, _id: 'b1' });

      const result = await bookService.createBook(mockData, 'staff1');

      expect(result._id).toBe('b1');
      expect(mockBookRepo.create).toHaveBeenCalled();
    });
  });

  describe('deleteBook', () => {
      it('should throw error if book has borrowed copies', async () => {
          mockBookRepo.findById.mockResolvedValue({ _id: 'b1', borrowed: 2 });
          await expect(bookService.deleteBook('b1')).rejects.toThrow('Cannot delete book with borrowed copies');
      });
  });
});
