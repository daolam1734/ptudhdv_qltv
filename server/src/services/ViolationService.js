const BaseService = require('../utils/BaseService');

class ViolationService extends BaseService {
  constructor(repository, readerService) {
    super(repository);
    this.readerService = readerService;
  }

  async createViolation(data) {
    // Ensure amount is a valid number
    if (isNaN(data.amount) || data.amount < 0) {
      data.amount = 0;
    }
    
    // Default status if not provided
    if (!data.status) data.status = 'chưa thanh toán';
    
    const violation = await this.repository.create(data);
    
    // Update reader's total unpaid violations
    if (data.amount > 0 && (data.status === 'unpaid' || data.status === 'chưa thanh toán')) {
      await this.readerService.updateUnpaidViolations(data.readerId, data.amount);
    }
    
    return violation;
  }

  async payViolation(violationId, staffId) {
    const violation = await this.repository.findById(violationId);
    if (!violation) throw new Error('Violation record not found');
    if (violation.status === 'paid' || violation.status === 'đã thanh toán') {
      throw new Error('Violation already paid');
    }

    const updatedViolation = await this.repository.update(violationId, {
      status: 'đã thanh toán',
      paidAt: new Date(),
      staffId
    });

    // Reduce reader's total unpaid violations
    await this.readerService.updateUnpaidViolations(violation.readerId, -violation.amount);

    return updatedViolation;
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
      } else {
        // Partial pay
        const newAmount = violation.amount - remainingToPay;
        await this.repository.update(violation._id, { 
          amount: newAmount,
          description: (violation.description || "") + ` (Đã thanh toán một phần: ${remainingToPay}đ)`
        });
        remainingToPay = 0;
      }
    }

    // Reduce reader's total unpaid violations
    await this.readerService.updateUnpaidViolations(readerId, -amount);

    return { success: true, amountPaid: amount };
  }
}

module.exports = ViolationService;
