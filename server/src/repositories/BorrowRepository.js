const BaseRepository = require('../utils/BaseRepository');

class BorrowRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async findActiveByReader(readerId) {
    return await this.model.find({
      readerId,
      status: { $in: ['borrowed', 'overdue'] }
    }).populate('bookId');
  }

  async findOverdue() {
    return await this.model.find({
      status: 'borrowed',
      dueDate: { $lt: new Date() }
    }).populate('readerId bookId');
  }

  async updateStatus(id, status, returnDate = null, fine = null) {
    const update = { status };
    if (returnDate) update.returnDate = returnDate;
    if (fine) update.fine = fine;
    
    return await this.model.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );
  }
}

module.exports = BorrowRepository;
