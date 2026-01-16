const BaseService = require('../utils/BaseService');

class ViolationService extends BaseService {
  constructor(repository, readerService) {
    super(repository);
    this.readerService = readerService;
  }

  async createViolation(data) {
    const violation = await this.repository.create(data);
    
    // Update reader's total unpaid violations (default is unpaid if not specified)
    if (!data.status || data.status === 'unpaid') {
      await this.readerService.updateUnpaidViolations(data.readerId, data.amount);
    }
    
    return violation;
  }

  async payViolation(violationId, staffId) {
    const violation = await this.repository.findById(violationId);
    if (!violation) throw new Error('Violation record not found');
    if (violation.status === 'paid') throw new Error('Violation already paid');

    const updatedViolation = await this.repository.update(violationId, {
      status: 'paid',
      paidDate: new Date()
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
          status: 'paid',
          paidDate: new Date()
        });
      } else {
        // Partial pay
        const newAmount = violation.amount - remainingToPay;
        await this.repository.update(violation._id, { amount: newAmount });
        remainingToPay = 0;
      }
    }

    // Reduce reader's total unpaid violations
    await this.readerService.updateUnpaidViolations(readerId, -amount);

    return { success: true, amountPaid: amount };
  }
}

module.exports = ViolationService;
