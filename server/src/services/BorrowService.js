const BaseService = require("../utils/BaseService");

class BorrowService extends BaseService {
  constructor(repository, bookService, readerService, violationService) {
    super(repository);
    this.bookService = bookService;
    this.readerService = readerService;
    this.violationService = violationService;
  }

  async borrowBook(data) {
    const { readerId, bookId, bookIds, staffId, durationDays = 14 } = data;
    
    // 0. Xử lý danh sách sách mượn (Hỗ trợ cả mượn 1 cuốn hoặc nhiều cuốn)
    const finalBookIds = bookIds || (bookId ? [bookId] : []);
    if (finalBookIds.length === 0) {
      const error = new Error("Vui lòng chọn ít nhất một cuốn sách để mượn");
      error.status = 400;
      throw error;
    }

    if (finalBookIds.length > 5) {
      const error = new Error("Mỗi lần mượn chỉ được tối đa 5 cuốn sách");
      error.status = 400;
      throw error;
    }

    const reader = await this.readerService.getById(readerId);
    if (!reader) {
      const error = new Error("Không tìm thấy thông tin độc giả");
      error.status = 404;
      throw error;
    }
    
    if (reader.status !== "active") {
      const error = new Error("Tài khoản độc giả hiện không ở trạng thái hoạt động");
      error.status = 400;
      throw error;
    }
    
    // 1. Kiểm tra tài liệu quá hạn
    const overdueRecord = await this.repository.findOne({
      readerId,
      status: "borrowed",
      dueDate: { $lt: new Date() }
    });
    if (overdueRecord) {
      const error = new Error("Bạn không thể mượn thêm sách khi đang có tài liệu quá hạn chưa trả.");
      error.status = 400;
      throw error;
    }

    // 2. Kiểm tra số lần mượn trong tuần (Tối đa 2 lần/tuần)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Đếm số lượng phiên mượn (borrowSessionId) duy nhất trong tuần qua
    const weeklySessions = await this.repository.model.distinct('borrowSessionId', {
      readerId,
      borrowDate: { $gte: oneWeekAgo },
      borrowSessionId: { $ne: null }
    });

    if (weeklySessions.length >= 2) {
      const error = new Error("Mỗi độc giả chỉ được thực hiện tối đa 02 lần mượn trong một tuần.");
      error.status = 400;
      throw error;
    }
    
    // 3. Kiểm tra vi phạm nội quy (Có khoản phạt chưa thanh toán)
    if (reader.unpaidViolations > 0) {
      const error = new Error("Bạn có khoản phí vi phạm chưa thanh toán. Vui lòng thanh toán trước khi tiếp tục mượn sách.");
      error.status = 400;
      throw error;
    }

    if (reader.suspendedUntil && reader.suspendedUntil > new Date()) {
      const error = new Error(`Tài khoản độc giả đang bị đình chỉ đến ngày ${reader.suspendedUntil.toLocaleDateString('vi-VN')}`);
      error.status = 400;
      throw error;
    }

    // 4. Số lượng mượn tối đa (Theo hạn mức của từng độc giả)
    const totalAfterBorrow = (reader.currentBorrowCount || 0) + finalBookIds.length;
    if (totalAfterBorrow > (reader.borrowLimit || 5)) {
      const error = new Error(`Bạn đã vượt quá số lượng tài liệu cho phép (${reader.borrowLimit || 5} cuốn). Hiện bạn đang mượn ${reader.currentBorrowCount} cuốn và muốn mượn thêm ${finalBookIds.length} cuốn.`);
      error.status = 400;
      throw error;
    }

    // 5. Kiểm tra tính khả dụng của từng cuốn sách và gom nhóm số lượng
    const bookQuantities = {};
    for (const bId of finalBookIds) {
      bookQuantities[bId] = (bookQuantities[bId] || 0) + 1;
    }

    // Kiểm tra tồn kho cho từng nhóm
    for (const [bId, qty] of Object.entries(bookQuantities)) {
      const book = await this.bookService.getById(bId);
      if (!book) {
        throw new Error(`Không tìm thấy sách với ID: ${bId}`);
      }
      if (book.status !== "available" || book.available < qty) {
        throw new Error(`Sách "${book.title}" hiện chỉ còn ${book.available} cuốn, không đủ để mượn ${qty} cuốn`);
      }
    }

    const isPending = !staffId;
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + durationDays);
    
    // Tạo ID phiên mượn duy nhất cho lần này
    const borrowSessionId = `SESS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const results = [];

    // Tạo các bản ghi mượn và cập nhật kho theo từng quyển
    for (const bId of finalBookIds) {
      const borrowRecord = await this.repository.create({
        readerId,
        bookId: bId,
        staffId: staffId || null,
        borrowDate,
        dueDate,
        borrowSessionId,
        status: isPending ? "pending" : "borrowed"
      });

      // Cập nhật số lượng trong kho bằng $inc để tránh lỗi đua dữ liệu
      await this.bookService.repository.model.findByIdAndUpdate(bId, {
        $inc: {
          available: -1,
          borrowed: 1,
          totalBorrowed: 1
        }
      });

      results.push(borrowRecord);
    }

    // Cập nhật số lượng mượn của độc giả
    await this.readerService.repository.model.findByIdAndUpdate(readerId, {
      $inc: { 
        currentBorrowCount: finalBookIds.length,
        totalBorrowed: finalBookIds.length 
      }
    });

    return results.length === 1 ? results[0] : results;
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

  async cancelBorrow(borrowId, readerId) {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Không tìm thấy thông tin lượt mượn");

    // Chỉ có thể hủy khi đang chờ duyệt
    if (record.status !== "pending") {
      throw new Error("Chỉ có thể hủy yêu cầu mượn khi đang trong trạng thái chờ duyệt");
    }

    // Kiểm tra quyền sở hữu
    if (record.readerId.toString() !== readerId.toString()) {
      throw new Error("Bạn không có quyền hủy yêu cầu mượn này");
    }

    // 1. Phục hồi số lượng trong kho
    const book = await this.bookService.getById(record.bookId);
    if (book) {
      await this.bookService.repository.model.findByIdAndUpdate(record.bookId, {
        $inc: {
          available: 1,
          borrowed: -1,
          totalBorrowed: -1
        }
      });
    }

    // 2. Giảm số lượng đang mượn của độc giả
    await this.readerService.repository.model.findByIdAndUpdate(readerId, {
      $inc: { 
        currentBorrowCount: -1,
        totalBorrowed: -1 
      }
    });

    return await this.repository.update(borrowId, {
      status: "cancelled",
      notes: "Độc giả đã hủy yêu cầu mượn"
    });
  }

  async renewBorrow(borrowId) {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Borrow record not found");

    // Rule 1: Không được gia hạn sách đã quá hạn
    const now = new Date();
    if (record.status === "overdue" || now > record.dueDate) {
      throw new Error("Không thể gia hạn vì sách đã quá hạn. Vui lòng trả sách và xử lý phí vi phạm (nếu có).");
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
      violation: null
    };

    let totalViolationAmount = 0;
    let violationReasons = [];

    // 1. Calculate overdue violation fee
    if (returnDate > record.dueDate) {
      const diffTime = Math.abs(returnDate - record.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalViolationAmount += diffDays * 5000; // 5000 VND/day
      violationReasons.push("quá hạn");

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
       
       totalViolationAmount += damageAmount;
       violationReasons.push(reasonLabel);
    }

    // 3. Create single violation record if there's any fee
    if (totalViolationAmount > 0) {
      result.violation = await this.violationService.createViolation({
        readerId: record.readerId,
        borrowId: record._id,
        amount: totalViolationAmount,
        reason: violationReasons.join(" & "),
        description: notes || `Phí vi phạm do ${violationReasons.join(" và ")}`
      });
    }

    // 4. Update Borrow record
    const updateData = {
      status,
      returnDate,
      notes
    };

    if (result.violation) {
      updateData.violation = {
        amount: result.violation.amount,
        reason: result.violation.reason,
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

  async getStatistics() {
    return await this.repository.getStatistics();
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
