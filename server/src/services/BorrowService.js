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
      status: "đang mượn",
      dueDate: { $lt: new Date() }
    });
    if (overdueRecord) {
      const error = new Error("Bạn không thể mượn thêm sách khi đang có tài liệu quá hạn chưa trả.");
      error.status = 400;
      throw error;
    }

    // 2. Kiểm tra số lần mượn trong tuần (Tối đa 03 lần/tuần)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Đếm số lượng phiên mượn (borrowSessionId) duy nhất trong tuần qua
    // Chỉ tính các yêu cầu ĐÃ PHÁT SÁCH (đang mượn, đã trả, quá hạn)
    // Các yêu cầu "đang chờ" hoặc "đã duyệt" chưa tính vào giới hạn lượt mượn trong tuần
    const weeklySessions = await this.repository.model.distinct('borrowSessionId', {
      readerId,
      borrowDate: { $gte: oneWeekAgo },
      borrowSessionId: { $ne: null },
      status: { $in: ["đang mượn", "borrowed", "đã trả", "returned", "quá hạn", "overdue", "đã trả (vi phạm)"] }
    });

    if (weeklySessions.length >= 3) {
      const error = new Error("Độc giả đã đạt giới hạn 03 lần mượn (đã nhận sách) trong tuần này. Vui lòng quay lại vào tuần sau.");
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

    // Chuẩn bị danh sách sách cho bản ghi gộp
    const books = finalBookIds.map(bId => ({
      bookId: bId,
      status: isPending ? "đang chờ" : "đang mượn",
      renewalCount: 0,
      violation: { amount: 0 }
    }));

    // Tạo MỘT bản ghi mượn duy nhất cho toàn bộ danh sách sách
    const borrowRecord = await this.repository.create({
      readerId,
      books, // Lưu toàn bộ mảng sách vào một yêu cầu
      staffId: staffId || null,
      borrowDate,
      dueDate,
      borrowSessionId,
      status: isPending ? "đang chờ" : "đang mượn"
    });

    // Cập nhật kho cho từng quyển sách
    for (const bId of finalBookIds) {
      await this.bookService.repository.model.findByIdAndUpdate(bId, {
        $inc: {
          available: -1,
          borrowed: 1,
          totalBorrowed: 1
        }
      });
    }

    // Cập nhật số lượng mượn của độc giả
    await this.readerService.repository.model.findByIdAndUpdate(readerId, {
      $inc: { 
        currentBorrowCount: finalBookIds.length,
        totalBorrowed: finalBookIds.length 
      }
    });

    return borrowRecord;
  }

  async approveBorrow(borrowId, staffId) {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Không tìm thấy bản ghi mượn sách.");
    
    // Nếu đã duyệt rồi thì trả về luôn để tránh lỗi double click
    if (["đã duyệt", "approved"].includes(record.status)) {
      return record;
    }

    if (!["đang chờ", "pending"].includes(record.status)) {
      throw new Error(`Yêu cầu này không thể phê duyệt (Trạng thái hiện tại: ${record.status}). Chỉ có thể duyệt các yêu cầu đang ở trạng thái Chờ duyệt.`);
    }

    // Cập nhật trạng thái cho cả yêu cầu và từng cuốn sách bên trong
    const bookItems = record.books || (record.bookId ? [{ bookId: record.bookId }] : []);
    const updatedBooks = bookItems.map(item => ({
      ...(item.toObject ? item.toObject() : item),
      status: "đã duyệt"
    }));

    return await this.repository.update(borrowId, {
      status: "đã duyệt",
      books: updatedBooks,
      staffId
    });
  }

  async issueBook(borrowId, staffId) {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Không tìm thấy bản ghi mượn sách.");
    
    // Nếu đã phát sách rồi
    if (["đang mượn", "borrowed"].includes(record.status)) {
      return record;
    }

    // Can issue if approved or directly from pending (for walk-in pickup)
    if (!["đã duyệt", "approved", "đang chờ", "pending"].includes(record.status)) {
      throw new Error(`Không thể phát sách (Trạng thái hiện tại: ${record.status}). Sách chỉ có thể được phát khi đang ở trạng thái Chờ duyệt hoặc Đã duyệt.`);
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    // Default 14 days from pickup
    dueDate.setDate(borrowDate.getDate() + 14);

    // Cập nhật trạng thái cho từng cuốn sách bên trong
    const bookItems = record.books || (record.bookId ? [{ bookId: record.bookId }] : []);
    const updatedBooks = bookItems.map(item => ({
      ...(item.toObject ? item.toObject() : item),
      status: "đang mượn"
    }));

    return await this.repository.update(borrowId, {
      status: "đang mượn",
      books: updatedBooks,
      staffId,
      borrowDate,
      dueDate
    });
  }

  async rejectBorrow(borrowId, staffId, notes = "") {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Không tìm thấy bản ghi mượn sách.");
    
    // Nếu đã từ chối hoặc hủy rồi thì không trả về lỗi 500 mà trả về kết quả hiện tại
    if (["từ chối", "rejected", "đã hủy", "cancelled"].includes(record.status)) {
      return record;
    }

    if (!["đang chờ", "pending", "đã duyệt", "approved"].includes(record.status)) {
      throw new Error(`Không thể từ chối yêu cầu này. Trạng thái hiện tại: ${record.status}. Chỉ có thể từ chối khi đang ở trạng thái Chờ duyệt hoặc Đã duyệt.`);
    }

    // Hoàn trả số lượng vào kho cho TẤT CẢ các sách trong yêu cầu
    const bookItems = record.books || (record.bookId ? [{ bookId: record.bookId }] : []);
    for (const item of bookItems) {
      const book = await this.bookService.getById(item.bookId);
      if (book) {
        await this.bookService.update(item.bookId, {
          available: book.available + 1,
          borrowed: Math.max(0, (book.borrowed || 1) - 1)
        });
      }
    }

    // Giảm số lượng mượn hiện tại của độc giả
    const bookCount = bookItems.length;
    await this.readerService.repository.model.findByIdAndUpdate(record.readerId, {
      $inc: { 
        currentBorrowCount: -bookCount,
        totalBorrowed: -bookCount 
      }
    });

    const updatedBooks = bookItems.map(item => ({
      ...(item.toObject ? item.toObject() : item),
      status: "từ chối"
    }));

    return await this.repository.update(borrowId, {
      status: "từ chối",
      books: updatedBooks,
      staffId,
      notes: notes || "Yêu cầu mượn sách bị từ chối"
    });
  }

  async cancelBorrow(borrowId, userId, isStaff = false) {
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Không tìm thấy thông tin lượt mượn");

    // Nếu đã hủy hoặc từ chối rồi thì không báo lỗi
    if (["đã hủy", "cancelled", "từ chối", "rejected"].includes(record.status)) {
      return record;
    }

    // Chỉ có thể hủy khi đang chờ duyệt hoặc đã duyệt (nhưng chưa phát sách)
    if (!["đang chờ", "pending", "đã duyệt", "approved"].includes(record.status)) {
      throw new Error(`Chỉ có thể hủy yêu cầu mượn khi đang trong trạng thái chờ duyệt hoặc đã duyệt. Trạng thái hiện tại: ${record.status}`);
    }

    // Kiểm tra quyền sở hữu (Bypass nếu là thủ thư/admin)
    if (!isStaff && record.readerId.toString() !== userId.toString()) {
      throw new Error("Bạn không có quyền hủy yêu cầu mượn này");
    }

    // 1. Phục hồi số lượng trong kho cho TẤT CẢ các sách
    const bookItems = record.books || (record.bookId ? [{ bookId: record.bookId }] : []);
    for (const item of bookItems) {
      const book = await this.bookService.getById(item.bookId);
      if (book) {
        await this.bookService.repository.model.findByIdAndUpdate(item.bookId, {
          $inc: {
            available: 1,
            borrowed: -1,
            totalBorrowed: -1
          }
        });
      }
    }

    // 2. Giảm số lượng đang mượn của độc giả
    const bookCount = bookItems.length;
    await this.readerService.repository.model.findByIdAndUpdate(record.readerId, {
      $inc: { 
        currentBorrowCount: -bookCount,
        totalBorrowed: -bookCount 
      }
    });

    const updatedBooks = bookItems.map(item => ({
      ...(item.toObject ? item.toObject() : item),
      status: "đã hủy"
    }));

    return await this.repository.update(borrowId, {
      status: "đã hủy",
      books: updatedBooks,
      notes: isStaff ? `Thủ thư đã hủy yêu cầu (ID thực hiện: ${userId})` : "Độc giả đã hủy yêu cầu mượn"
    });
  }

  async renewBorrow(borrowId) {
    const record = await this.repository.findById(borrowId, 'books.bookId');
    if (!record) throw new Error("Không tìm thấy bản ghi mượn sách");

    // Rule 1: Không được gia hạn sách đã quá hạn
    const now = new Date();
    if (["quá hạn", "overdue"].includes(record.status) || now > new Date(record.dueDate)) {
      throw new Error("Không thể gia hạn vì sách đã quá hạn. Vui lòng trả sách và xử lý phí vi phạm (nếu có).");
    }

    if (!["đang mượn", "borrowed"].includes(record.status)) {
      throw new Error("Chỉ có thể gia hạn sách đang trong trạng thái mượn.");
    }

    // Rule 2: Mỗi cuốn sách được gia hạn tối đa 2 lần (Áp dụng cho toàn bộ yêu cầu)
    if (record.renewalCount >= 2) {
      throw new Error(`Yêu cầu này đã đạt giới hạn gia hạn tối đa (2 lần).`);
    }

    // Rule 3: Có người khác đặt giữ sách (yêu cầu pending) cho bất kỳ sách nào trong list
    const bookItems = record.books || (record.bookId ? [{ bookId: record.bookId }] : []);
    for (const item of bookItems) {
        const bookId = item.bookId._id || item.bookId;
        const pendingOthers = await this.repository.findAll({
          'books.bookId': bookId,
          _id: { $ne: record._id },
          status: { $in: ["đang chờ", "pending"] }
        });

        if (pendingOthers.data && pendingOthers.data.length > 0) {
          throw new Error(`Không thể gia hạn vì đang có độc giả khác đặt giữ cuốn sách "${item.bookId?.title || 'trong danh sách'}".`);
        }
    }

    // Rule 4: Thời gian gia hạn: gia hạn thêm 14 ngày
    const newDueDate = new Date(record.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 14);

    // Cập nhật gia hạn cho cả record và các items bên trong
    const updatedBooks = bookItems.map(item => ({
       ...(item.toObject ? item.toObject() : item),
       renewalCount: (item.renewalCount || 0) + 1
    }));

    return await this.repository.update(borrowId, {
      dueDate: newDueDate,
      renewalCount: (record.renewalCount || 0) + 1,
      books: updatedBooks
    });
  }

  async returnBook(borrowId, staffId, details = {}) {
    const { status = "đã trả", notes = "", violationAmount = 0, violationReason = "" } = details;
    const record = await this.repository.findById(borrowId);
    if (!record) throw new Error("Borrow record not found");
    if (['returned', 'lost', 'damaged_heavy', 'đã trả', 'làm mất', 'hư hỏng nặng'].includes(record.status)) {
      throw new Error("Book already returned or record is closed");
    }

    const returnDate = new Date();
    const result = {
      record: null,
      violation: null
    };

    let totalViolationAmount = 0;
    let violationReasons = [];

    // 1. Calculate overdue violation fee (STILL AUTOMATIC)
    if (record.dueDate && returnDate > new Date(record.dueDate)) {
      const diffTime = Math.abs(returnDate - new Date(record.dueDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const overdueFee = diffDays * 5000;
      if (!isNaN(overdueFee)) {
        totalViolationAmount += overdueFee;
        violationReasons.push("quá hạn");
      }

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

    // 2. Add manual violation fee from staff (Simplified redesign)
    const manualFee = parseFloat(violationAmount) || 0;
    if (manualFee > 0) {
      totalViolationAmount += manualFee;
      if (violationReason) violationReasons.push(violationReason);
      else violationReasons.push("vi phạm khi trả");
    }

    // 3. Create single violation record if there's any fee
    const finalAmount = Math.round(totalViolationAmount);
    if (!isNaN(finalAmount) && finalAmount > 0) {
      result.violation = await this.violationService.createViolation({
        readerId: record.readerId,
        borrowId: record._id,
        amount: finalAmount,
        reason: violationReasons.join(" & "),
        description: notes || `Phí vi phạm ghi nhận khi thu hồi sách`,
        staffId
      });
    }

    // 4. Update Borrow record
    const finalStatus = (status === 'vi phạm' || finalAmount > 0) ? "đã trả (vi phạm)" : "đã trả";
    
    // Cập nhật trạng thái cho từng cuốn sách
    const updatedBooks = record.books.map(item => ({
      ...item.toObject(),
      status: finalStatus,
      returnDate
    }));

    const updateData = {
      status: finalStatus,
      books: updatedBooks,
      returnDate,
      notes,
      staffId
    };

    if (result.violation) {
      updateData.violation = {
        amount: result.violation.amount,
        reason: result.violation.reason,
        isPaid: false
      };
    }

    result.record = await this.repository.update(borrowId, updateData);

    // 5. Update book inventory and quantities for ALL books
    const bookItems = record.books || (record.bookId ? [{ bookId: record.bookId }] : []);
    for (const item of bookItems) {
        const book = await this.bookService.getById(item.bookId);
        if (book) {
          await this.bookService.update(item.bookId, {
            available: (book.available || 0) + 1,
            borrowed: Math.max(0, (book.borrowed || 0) - 1)
          });
        }
    }

    // Giảm số lượng mượn hiện tại của độc giả
    await this.readerService.repository.model.findByIdAndUpdate(record.readerId, {
        $inc: { currentBorrowCount: -bookItems.length }
    });

    return result;
  }

  async getStatistics() {
    return await this.repository.getStatistics();
  }

  async getReaderHistory(readerId) {
    const result = await this.repository.findAll(
      { readerId }, 
      { sort: { createdAt: -1 }, populate: ["books.bookId"], limit: 1000 }
    );
    return result.data;
  }
}

module.exports = BorrowService;
