const BaseService = require('../utils/BaseService');

class FineService extends BaseService {
  constructor(repository, readerService) {
    super(repository);
    this.readerService = readerService;
  }

  async createFine(data) {
    const fine = await this.repository.create(data);
    
    // Update reader's total unpaid fines (default is unpaid if not specified)
    if (!data.status || data.status === 'unpaid') {
      await this.readerService.updateUnpaidFines(data.readerId, data.amount);
    }
    
    return fine;
  }

  async payFine(fineId, staffId) {
    const fine = await this.repository.findById(fineId);
    if (!fine) throw new Error('Fine record not found');
    if (fine.status === 'paid') throw new Error('Fine already paid');

    const updatedFine = await this.repository.update(fineId, {
      status: 'paid',
      paidDate: new Date()
    });

    // Reduce reader's total unpaid fines
    await this.readerService.updateUnpaidFines(fine.readerId, -fine.amount);

    return updatedFine;
  }

  async getReaderFines(readerId) {
    return await this.repository.findByReader(readerId);
  }
}

module.exports = FineService;
