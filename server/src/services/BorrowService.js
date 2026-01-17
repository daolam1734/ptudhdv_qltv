const BaseService = require("../utils/BaseService");

class BorrowService extends BaseService {
  constructor(repository, bookService, readerService, violationService, notificationService) {
    super(repository);
    this.bookService = bookService;
    this.readerService = readerService;
    this.violationService = violationService;
    this.notificationService = notificationService;
  }

  async borrowBook(data) {
    const { readerId, bookId, bookIds, staffId, durationDays = 14 } = data;
    
    // 0. Xử lý danh sách sách mượn (Hỗ trợ cả mượn 1 cuốn hoặc nhiều cuốn)
    let finalBookIds = (bookIds || (bookId ? [bookId] : [])).map(id => id.toString());

    if (finalBookIds.length === 0) {
      const error = new Error("Vui lòng chọn ít nhất một tài liệu để mượn");
      error.status = 400;
      throw error;
    }

    if (finalBookIds.length > 5) {
      const error = new Error("Một đợt mượn không được quá 5 cuốn sách. Vui lòng tách thành các đợt khác nhau.");
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
      const error = new Error("Tài khoản độc giả hiện đang bị khóa hoặc không hoạt động");
      error.status = 400;
      throw error;
    }
    
    // 1. Kiểm tra tài liệu quá hạn (Chặn tuyệt đối nếu có sách quá hạn)
    const overdueRecord = await this.repository.findOne({
      readerId,
      status: { $in: ["đang mượn", "borrowed", "quá hạn", "overdue"] },
      dueDate: { $lt: new Date() }
    });
    if (overdueRecord) {
      const error = new Error("Bạn đang có tài liệu quá hạn chưa trả. Vui lòng hoàn trả sách trước khi thực hiện mượn mới.");
      error.status = 400;
      throw error;
    }

    // 2. Kiểm tra số lần mượn trong tuần (Tối đa 03 lần/tuần)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklySessions = await this.repository.model.distinct('borrowSessionId', {
      readerId,
      borrowDate: { $gte: oneWeekAgo },
      borrowSessionId: { $ne: null },
      status: { $in: ["đang mượn", "borrowed", "đã trả", "returned", "quá hạn", "overdue", "đã trả (vi phạm)"] }
    });

    if (weeklySessions.length >= 3) {
      const error = new Error("Bạn đã thực hiện 03 lượt lấy sách trong tuần qua. Theo quy định, vui lòng quay lại vào tuần sau.");
      error.status = 400;
      throw error;
    }

    // 3. Ràng buộc: Lấy danh sách các sách đang mượn hoặc chờ duyệt
    const activeBorrows = await this.repository.model.find({
      readerId,
      status: { $in: ["đang chờ", "pending", "đã duyệt", "approved", "đang mượn", "borrowed"] }
    });

    const currentlyHeldBookIds = activeBorrows.reduce((acc, rec) => {
      const items = rec.books || [];
      items.forEach(item => acc.push(item.bookId.toString()));
      return acc;
    }, []);
    
    // 4. Kiểm tra khoản phạt chưa thanh toán
    if (reader.unpaidViolations > 20000) { // Ví dụ: Cho phép nợ dưới 20k
      const error = new Error(`Bạn có khoản phí phạt chưa thanh toán (${reader.unpaidViolations.toLocaleString()}đ). Vui lòng thanh toán tại quầy trước khi mượn thêm.`);
      error.status = 400;
      throw error;
    }

    // 5. Số lượng mượn tối đa (Check hạn mức của độc giả)
    const currentActiveCount = currentlyHeldBookIds.length;
    const limit = Number(reader.borrowLimit) || 5;

    if (currentActiveCount + finalBookIds.length > limit) {
      const error = new Error(`Tổng số sách bạn đang mượn và đăng ký (${currentActiveCount + finalBookIds.length}) vượt quá hạn mức cho phép (${limit} cuốn).`);
      error.status = 400;
      throw error;
    }

    // 6. Kiểm tra tồn kho của từng cuốn sách (Bao gồm cả trường hợp mượn nhiều cuốn giống nhau)
    const bookQuantities = {};
    for (const bId of finalBookIds) {
      bookQuantities[bId] = (bookQuantities[bId] || 0) + 1;
    }

    for (const [bId, qty] of Object.entries(bookQuantities)) {
      const book = await this.bookService.getById(bId);
      if (book.status !== "available" || book.available < qty) {
        const error = new Error(`Tài liệu "${book.title}" hiện chỉ còn ${book.available} cuốn, không đủ để mượn ${qty} cuốn.`);
        error.status = 400;
        throw error;
      }
    }

    const isPending = !staffId;
    const borrowDate = new Date();
    const dueDate = new Date();
    const daysToBorrowed = Number(durationDays) || 14;
    dueDate.setDate(borrowDate.getDate() + daysToBorrowed);
    
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

    const updatedRecord = await this.repository.update(borrowId, {
      status: "đã duyệt",
      books: updatedBooks,
      staffId
    });

    // Gửi thông báo cho độc giả
    if (this.notificationService) {
      const bookTitles = record.books?.map(b => b.bookId?.title).filter(Boolean) || [];
      await this.notificationService.notifyBorrowStatus(record.readerId, borrowId, "đã duyệt", bookTitles);
    }

    return updatedRecord;
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

    const updatedRecord = await this.repository.update(borrowId, {
      status: "đang mượn",
      books: updatedBooks,
      staffId,
      borrowDate,
      dueDate
    });

    // Gửi thông báo cho độc giả
    if (this.notificationService) {
      const bookTitles = record.books?.map(b => b.bookId?.title).filter(Boolean) || [];
      await this.notificationService.notifyBorrowStatus(record.readerId, borrowId, "đang mượn", bookTitles);
    }

    return updatedRecord;
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

    const updatedRecord = await this.repository.update(borrowId, {
      status: "từ chối",
      books: updatedBooks,
      staffId,
      notes: notes || "Yêu cầu mượn sách bị từ chối"
    });

    // Gửi thông báo cho độc giả
    if (this.notificationService) {
      const bookTitles = record.books?.map(b => b.bookId?.title).filter(Boolean) || [];
      await this.notificationService.notifyBorrowStatus(record.readerId, borrowId, "từ chối", bookTitles);
    }

    return updatedRecord;
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
    const { books: bookUpdates = [], notes = "", violationAmount = 0, violationReason = "", status } = details;
    const record = await this.repository.model.findById(borrowId).populate('books.bookId');
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
    const isOverdue = record.dueDate && returnDate > new Date(record.dueDate);
    let systemOverdueFee = 0;
    if (isOverdue) {
      const diffTime = Math.abs(returnDate - new Date(record.dueDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      systemOverdueFee = diffDays * 5000;
      
      if (!isNaN(systemOverdueFee) && systemOverdueFee > 0) {
        // systemOverdueFee sẽ được cộng vào tổng sau khi so sánh với manualGeneralFee
      }

      // Update reader overdue count
      const updatedReader = await this.readerService.repository.update(record.readerId, {
        $inc: { overdueCount: 1 }
      });

      if (updatedReader && updatedReader.status === 'active' && updatedReader.overdueCount >= 2) {
        await this.readerService.repository.update(record.readerId, {
          status: 'suspended',
          notes: (updatedReader.notes ? updatedReader.notes + ". " : "") + "Tự động đình chỉ do tích lũy 2 lượt quá hạn"
        });
      }
    }

    // 2. Process Books individually if provided, else use global status
    const manualGeneralFee = parseFloat(violationAmount) || 0;
    let finalRecordStatus = "đã trả";
    
    const updatedBooks = record.books.map(item => {
      const bookIdStr = item.bookId?._id?.toString() || item.bookId?.toString();
      const updateEntry = bookUpdates.find(u => (u.bookId?._id || u.bookId)?.toString() === bookIdStr);
      
      let bookStatus = details.status || "đã trả";
      let bookFee = 0;

      if (updateEntry) {
        bookStatus = updateEntry.status || "đã trả";
        bookFee = parseFloat(updateEntry.violationAmount) || 0;
        
        if (bookFee > 0) {
          const reasonText = updateEntry.reason || (bookStatus === "làm mất" ? "Làm mất tài liệu" : "Hư hại tài liệu");
          violationReasons.push(`${reasonText} (Sách ${item.bookId?.title || 'ID ' + bookIdStr})`);
        }
      }

      totalViolationAmount += bookFee;

      return {
        ...(item.toObject ? item.toObject() : item),
        status: bookStatus,
        returnDate,
        violation: {
          amount: (item.violation?.amount || 0) + bookFee,
          reason: updateEntry?.reason || details.violationReason || (bookFee > 0 ? "Vi phạm tại chỗ" : "")
        }
      };
    });

    // Determine final record status based on most severe book status
    const statusPriority = { 'làm mất': 4, 'hư hỏng nặng': 3, 'đã trả (vi phạm)': 2, 'đã trả': 1 };
    let maxPriority = 0;
    updatedBooks.forEach(b => {
      const p = statusPriority[b.status] || 0;
      if (p > maxPriority) {
        maxPriority = p;
        finalRecordStatus = b.status;
      }
    });

    // Add general fee (use librarian's provided amount if they adjusted it, otherwise use auto-calculated overdue fine)
    // Note: in Professional UI, violationAmount from frontend is usually the (possibly adjusted) overdue fee
    const generalFeeCharge = manualGeneralFee > 0 ? manualGeneralFee : systemOverdueFee;
    totalViolationAmount += generalFeeCharge;
    
    if (generalFeeCharge > 0) {
      violationReasons.push(violationReason || (manualGeneralFee > 0 ? "Phí vi phạm tổng quát" : "Phí quá hạn"));
    }

    // 3. Create single violation record if there's any fee
    const finalAmount = Math.round(totalViolationAmount);
    if (!isNaN(finalAmount) && finalAmount > 0) {
      // Đảm bảo luôn có lý do nếu có tiền phạt
      const finalReason = [...new Set(violationReasons)].filter(Boolean).join(" | ") || "Vi phạm quy định mượn trả";

      result.violation = await this.violationService.createViolation({
        readerId: record.readerId,
        borrowId: record._id,
        amount: finalAmount,
        reason: finalReason,
        description: notes || `Tổng phí vi phạm thu hồi đợt mượn bởi thủ thư (ID: ${staffId})`,
        staffId
      });
    }

    const updateData = {
      status: finalRecordStatus,
      books: updatedBooks,
      returnDate,
      notes: notes + (violationReason ? ` | Ghi chú chung: ${violationReason}` : ""),
      staffId
    };

    if (result.violation) {
      updateData.violation = {
        amount: result.violation.amount,
        reason: result.violation.reason,
        isPaid: false
      };
    }

    result.record = await this.repository.model.findByIdAndUpdate(borrowId, updateData, { new: true })
      .populate('readerId', 'fullName username')
      .populate('books.bookId', 'title isbn');

    // Gửi thông báo cho độc giả
    if (this.notificationService) {
      const bookTitles = record.books?.map(b => b.bookId?.title).filter(Boolean) || [];
      await this.notificationService.notifyBorrowStatus(record.readerId, borrowId, finalRecordStatus, bookTitles);
    }

    // 5. Update book inventory
    for (const item of updatedBooks) {
        if (item.bookId) {
          const isLostOrDamaged = ["làm mất", "hư hỏng nặng"].includes(item.status);
          
          await this.bookService.repository.model.findByIdAndUpdate(item.bookId?._id || item.bookId, {
            $inc: {
              available: isLostOrDamaged ? 0 : 1,
              borrowed: -1
            },
            $set: isLostOrDamaged ? { status: item.status === "làm mất" ? "lost" : "damaged" } : {}
          });
        }
    }

    // 6. Cập nhật số lượng mượn và kiểm tra tự động kích hoạt lại tài khoản
    const updatedReader = await this.readerService.repository.model.findByIdAndUpdate(record.readerId, {
        $inc: { currentBorrowCount: -record.books.length }
    }, { new: true });

    if (updatedReader && updatedReader.status === 'suspended') {
        // Kiểm tra xem còn sách nào quá hạn không
        const otherOverdue = await this.repository.findOne({
            readerId: record.readerId,
            _id: { $ne: record._id },
            status: { $in: ["đang mượn", "borrowed", "quá hạn", "overdue"] },
            dueDate: { $lt: new Date() }
        });

        // Nếu sạch nợ (hệ thống cho phép nợ dưới 20k) và không còn sách quá hạn
        if (!otherOverdue && updatedReader.unpaidViolations <= 20000) {
            await this.readerService.repository.update(record.readerId, {
                status: 'active',
                notes: (updatedReader.notes || "") + " | Tự động kích hoạt lại sau khi hoàn trả sách quá hạn."
            });
        }
    }

    return result;
  }

  async getAll(filter = {}, options = {}) {
    // Nếu có yêu cầu sắp xếp tùy chỉnh hoặc không phải là yêu cầu lấy lịch sử cụ thể
    // chúng ta sẽ sử dụng phương thức findAllWithPriority
    if (!options.sort || (options.sort.createdAt === -1 && Object.keys(options.sort).length === 1)) {
        return await this.repository.findAllWithPriority(filter, options);
    }
    return await this.repository.findAll(filter, options);
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
