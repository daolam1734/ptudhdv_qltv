const BaseService = require('../utils/BaseService');

class ViolationService extends BaseService {
  constructor(repository, readerService, notificationService) {
    super(repository);
    this.readerService = readerService;
    this.notificationService = notificationService;
  }

  async createViolation(data) {
    // Ensure amount is a valid number
    if (isNaN(data.amount) || data.amount < 0) {
      data.amount = 0;
    }

    // Ensure reason is not empty
    if (!data.reason || data.reason.trim() === '') {
      data.reason = 'Vi phạm quy định thư viện';
    }
    
    // Default status if not provided
    if (!data.status) data.status = 'chưa thanh toán';
    
    const violation = await this.repository.create(data);
    
    // Update reader's total unpaid violations
    if (data.amount > 0 && (data.status === 'unpaid' || data.status === 'chưa thanh toán')) {
      await this.readerService.updateUnpaidViolations(data.readerId, data.amount);

      // Gửi thông báo cho độc giả về phí phạt mới
      if (this.notificationService) {
        await this.notificationService.notifyViolation(data.readerId, violation._id, data.amount, data.reason);
      }
    }
    
    return violation;
  }

  async payViolation(violationId, staffId) {
    if (!staffId) throw new Error("ID Thủ thư là bắt buộc để thực hiện thu phí.");

    const violation = await this.repository.findById(violationId);
    if (!violation) throw new Error('Không tìm thấy bản ghi vi phạm.');
    
    if (violation.status === 'paid' || violation.status === 'đã thanh toán') {
      throw new Error('Khoản phí này đã được thanh toán trước đó.');
    }

    const updatedViolation = await this.repository.update(violationId, {
      status: 'đã thanh toán',
      paidAt: new Date(),
      staffId
    });

    // Reduce reader's total unpaid violations
    const reader = await this.readerService.updateUnpaidViolations(violation.readerId, -violation.amount);

    // Gửi thông báo xác nhận thanh toán
    if (this.notificationService) {
      await this.notificationService.notifyViolation(
        violation.readerId, 
        violationId, 
        violation.amount, 
        violation.reason, 
        true // isPaymentConfirmed
      );
    }

    // Sync with Borrow record if exists
    const borrowId = violation.borrowId?._id || violation.borrowId;
    if (borrowId) {
      try {
        const mongoose = require('mongoose');
        const BorrowModel = mongoose.models.Borrow || require('../models/Borrow');
        await BorrowModel.findByIdAndUpdate(borrowId, {
          $set: {
            'violation.isPaid': true,
            'violation.paidAt': new Date()
          }
        });
        
        // KIỂM TRA TỰ ĐỘNG MỞ KHÓA TÀI KHOẢN
        if (reader && reader.status === 'suspended' && reader.unpaidViolations <= 20000) {
           // Kiểm tra xem còn sách nào quá hạn không
           const overdueCount = await BorrowModel.countDocuments({
              readerId: violation.readerId,
              status: { $in: ["đang mượn", "borrowed", "quá hạn", "overdue"] },
              dueDate: { $lt: new Date() }
           });

           if (overdueCount === 0) {
              await this.readerService.repository.update(violation.readerId, {
                status: 'active',
                notes: (reader.notes || "") + " | Tài khoản tự động kích hoạt lại sau khi thanh toán phí phạt."
              });
           }
        }
      } catch (syncError) {
        console.error('Failed to sync payment and check status:', syncError);
      }
    }

    return updatedViolation;
  }

  /**
   * Thanh toán toàn bộ nợ cho độc giả
   */
  async payAllViolations(readerId, staffId) {
    if (!staffId) throw new Error("ID Thủ thư là bắt buộc.");
    
    const unpaidList = await this.repository.findUnpaidByReader(readerId);
    if (unpaidList.length === 0) throw new Error("Độc giả không có khoản nợ nào cần thanh toán.");

    const results = [];
    let totalPaid = 0;

    for (const v of unpaidList) {
      const updated = await this.payViolation(v._id, staffId);
      results.push(updated);
      totalPaid += v.amount;
    }

    return {
      count: results.length,
      totalAmount: totalPaid,
      readerId
    };
  }

  async getReaderViolations(readerId) {
    return await this.repository.findByReader(readerId);
  }

  async payViolationByReader(readerId, amount) {
    const unpaidViolations = await this.repository.findUnpaidByReader(readerId);
    let remainingToPay = amount;

    for (const violation of unpaidViolations) {
      if (remainingToPay <= 0) break;

      if (violation.amount <= remainingToPay) {
        remainingToPay -= violation.amount;
        await this.repository.update(violation._id, {
          status: 'đã thanh toán',
          paidAt: new Date()
        });

        // Sync with Borrow record if exists
        const borrowId = violation.borrowId?._id || violation.borrowId;
        if (borrowId) {
          try {
            const mongoose = require('mongoose');
            const BorrowModel = mongoose.models.Borrow || require('../models/Borrow');
            await BorrowModel.findByIdAndUpdate(borrowId, {
              $set: {
                'violation.isPaid': true,
                'violation.paidAt': new Date()
              }
            });
          } catch (syncError) {
            console.error('Failed to sync batch payment to Borrow record:', syncError);
          }
        }
      } else {
        // Partial pay
        const newAmount = violation.amount - remainingToPay;
        const currentToPay = remainingToPay;
        await this.repository.update(violation._id, { 
          amount: newAmount,
          description: (violation.description || "") + ` (Đã thanh toán một phần: ${currentToPay}đ)`
        });

        // Sync partial payment to Borrow record if exists
        const borrowId = violation.borrowId?._id || violation.borrowId;
        if (borrowId) {
          try {
            const mongoose = require('mongoose');
            const BorrowModel = mongoose.models.Borrow || require('../models/Borrow');
            await BorrowModel.findByIdAndUpdate(borrowId, {
              $set: {
                'violation.amount': newAmount
              }
            });
          } catch (syncError) {
            console.error('Failed to sync partial payment to Borrow record:', syncError);
          }
        }
        remainingToPay = 0;
      }
    }

    // Reduce reader's total unpaid violations
    await this.readerService.updateUnpaidViolations(readerId, -amount);

    return { success: true, amountPaid: amount };
  }
}

module.exports = ViolationService;
