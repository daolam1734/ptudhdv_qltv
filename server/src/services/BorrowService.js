const BaseService = require("../utils/BaseService");

class BorrowService extends BaseService {
  constructor(repository, bookService, readerService, fineService) {
    super(repository);
    this.bookService = bookService;
    this.readerService = readerService;
    this.fineService = fineService;
  }

  async borrowBook(data) {
    const { readerId, bookId, staffId, durationDays = 14 } = data;

    const reader = await this.readerService.getById(readerId);
    if (!reader) throw new Error("Reader not found");
    if (reader.status !== "active") throw new Error("Reader account is not active");
    
    // Check for unpaid fines or suspension
    if (reader.unpaidFines > 50000) {
      throw new Error("Reader has exceeded unpaid fines limit. Please pay fines before borrowing.");
    }
    if (reader.suspendedUntil && reader.suspendedUntil > new Date()) {
      throw new Error(`Reader account is suspended until ${reader.suspendedUntil.toLocaleDateString()}`);
    }

    if (reader.currentBorrowCount >= reader.borrowLimit) {
      throw new Error(`Reader has reached the borrow limit of ${reader.borrowLimit} books`);
    }

    const book = await this.bookService.getById(bookId);
    if (!book) throw new Error("Book not found");
    if (book.status !== "available") throw new Error(`Book is currently ${book.status} and cannot be borrowed`);
    if (book.available <= 0) throw new Error("Book is currently out of stock");

    const isPending = !staffId;
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + durationDays);

    const borrowRecord = await this.repository.create({
      readerId,
      bookId,
      staffId: staffId || null,
      borrowDate,
      dueDate,
      status: isPending ? "pending" : "borrowed"
    });

    // We still decrement stock even for pending to reserve the book
    await this.bookService.update(bookId, {
      available: book.available - 1,
      borrowed: (book.borrowed || 0) + 1,
      totalBorrowed: (book.totalBorrowed || 0) + 1
    });

    await this.readerService.repository.incrementBorrowCount(readerId);

    return borrowRecord;
  }

  async approveBorrow(borrowId, staffId) {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Borrow record not found");
    if (record.status !== "pending") {
      throw new Error("Only pending requests can be approved");
    }

    return await this.repository.update(borrowId, {
      status: "approved",
      staffId
    });
  }

  async issueBook(borrowId, staffId) {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Borrow record not found");
    
    // Can issue if approved or directly from pending (for walk-in pickup)
    if (record.status !== "approved" && record.status !== "pending") {
      throw new Error("Sách chỉ có thể được phát khi đang ở trạng thái Chờ duyệt hoặc Đã duyệt");
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    // Default 14 days from pickup
    dueDate.setDate(borrowDate.getDate() + 14);

    return await this.repository.update(borrowId, {
      status: "borrowed",
      staffId,
      borrowDate,
      dueDate
    });
  }

  async rejectBorrow(borrowId, staffId, notes = "") {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Borrow record not found");
    if (record.status !== "pending" && record.status !== "approved") {
      throw new Error("Chỉ có thể từ chối/hủy yêu cầu khi đang ở trạng thái Chờ duyệt hoặc Đã duyệt");
    }

    // Return book to stock
    const book = await this.bookService.getById(record.bookId);
    if (book) {
      await this.bookService.update(record.bookId, {
        available: book.available + 1,
        borrowed: Math.max(0, (book.borrowed || 1) - 1)
      });
    }

    // Decrement reader borrow count
    await this.readerService.repository.decrementBorrowCount(record.readerId);

    return await this.repository.update(borrowId, {
      status: "rejected",
      staffId,
      notes: notes || "Yêu cầu mượn sách bị từ chối"
    });
  }

  async renewBorrow(borrowId) {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Borrow record not found");

    // Rule 1: Không được gia hạn sách đã quá hạn
    const now = new Date();
    if (record.status === "overdue" || now > record.dueDate) {
      throw new Error("Không thể gia hạn vì sách đã quá hạn. Vui lòng trả sách và nộp phí phạt (nếu có).");
    }

    if (record.status !== "borrowed") {
      throw new Error("Chỉ có thể gia hạn sách đang trong trạng thái mượn.");
    }

    // Rule 2: Mỗi cuốn sách được gia hạn tối đa 2 lần
    if (record.renewalCount >= 2) {
      throw new Error(`Sách đã đạt giới hạn gia hạn tối đa (2 lần).`);
    }

    // Rule 3: Có người khác đặt giữ sách (yêu cầu pending)
    const pendingOthers = await this.repository.findAll({
      bookId: record.bookId,
      status: "pending"
    });

    if (pendingOthers.data && pendingOthers.data.length > 0) {
      throw new Error("Không thể gia hạn vì đang có độc giả khác đặt giữ cuốn sách này.");
    }

    // Rule 4: Thời gian gia hạn: gia hạn thêm 14 ngày
    const newDueDate = new Date(record.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 14);

    return await this.repository.update(borrowId, {
      dueDate: newDueDate,
      renewalCount: (record.renewalCount || 0) + 1
    });
  }

  async returnBook(borrowId, staffId, details = {}) {
    const { status = "returned", notes = "" } = details;
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Borrow record not found");
    if (['returned', 'lost', 'damaged_heavy'].includes(record.status)) {
      throw new Error("Book already returned or record is closed");
    }

    const returnDate = new Date();
    const result = {
      record: null,
      fine: null
    };

    let totalFineAmount = 0;
    let fineReasons = [];

    // 1. Calculate overdue fine
    if (returnDate > record.dueDate) {
      const diffTime = Math.abs(returnDate - record.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalFineAmount += diffDays * 5000; // 5000 VND/day
      fineReasons.push("quá hạn");

      // Update reader overdue count
      const updatedReader = await this.readerService.repository.update(record.readerId, {
        $inc: { overdueCount: 1 }
      });

      if (updatedReader && updatedReader.overdueCount >= 2 && updatedReader.status === 'active') {
        await this.readerService.repository.update(record.readerId, {
          status: 'suspended',
          notes: (updatedReader.notes ? updatedReader.notes + ". " : "") + "Tự động đình chỉ do tích lũy 2 lượt quá hạn"
        });
      }
    }

    // 2. Handle damaged or lost status
    if (["damaged", "damaged_heavy", "lost"].includes(status)) {
       const book = await this.bookService.getById(record.bookId);
       let damageAmount = 0;
       let reasonLabel = "";

       switch(status) {
         case "damaged":
           damageAmount = book.price * 0.3; 
           reasonLabel = "hư hỏng nhẹ";
           break;
         case "damaged_heavy":
           damageAmount = book.price * 1.0; 
           reasonLabel = "hư hỏng nặng";
           break;
         case "lost":
           damageAmount = book.price * 1.5; 
           reasonLabel = "làm mất";
           break;
       }
       
       totalFineAmount += damageAmount;
       fineReasons.push(reasonLabel);
    }

    // 3. Create single fine record if there's any fine
    if (totalFineAmount > 0) {
      result.fine = await this.fineService.createFine({
        readerId: record.readerId,
        borrowId: record._id,
        amount: totalFineAmount,
        reason: fineReasons.join(" & "),
        description: notes || `Phí phạt do ${fineReasons.join(" và ")}`
      });
    }

    // 4. Update Borrow record
    const updateData = {
      status,
      returnDate,
      notes
    };

    if (result.fine) {
      updateData.fine = {
        amount: result.fine.amount,
        reason: result.fine.reason,
        isPaid: false
      };
    }

    result.record = await this.repository.update(borrowId, updateData);

    // 5. Update book quantity
    if (status !== "lost" && status !== "damaged_heavy") {
      const book = await this.bookService.getById(record.bookId);
      await this.bookService.update(record.bookId, {
        available: book.available + 1,
        borrowed: Math.max(0, (book.borrowed || 0) - 1)
      });
    } else {
       const book = await this.bookService.getById(record.bookId);
       await this.bookService.update(record.bookId, {
         quantity: Math.max(0, book.quantity - 1),
         borrowed: Math.max(0, (book.borrowed || 0) - 1)
       });
    }

    await this.readerService.repository.decrementBorrowCount(record.readerId);

    return result;
  }

  async getReaderHistory(readerId) {
    const result = await this.repository.findAll(
      { readerId }, 
      { sort: { createdAt: -1 }, populate: ["bookId"], limit: 1000 }
    );
    return result.data;
  }
}

module.exports = BorrowService;
