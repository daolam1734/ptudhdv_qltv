const BaseRepository = require('../utils/BaseRepository');

class BorrowRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async findActiveByReader(readerId) {
    return await this.model.find({
      readerId,
      status: { $in: ['borrowed', 'overdue', 'đang mượn', 'quá hạn'] }
    })
    .populate('books.bookId', 'title author coverImage')
    .lean();
  }

  async findOverdue() {
    return await this.model.find({
      status: { $in: ['borrowed', 'đang mượn'] },
      dueDate: { $lt: new Date() }
    })
    .populate('readerId', 'username fullName phone')
    .populate('books.bookId', 'title isbn location')
    .lean();
  }

  async updateStatus(id, status, returnDate = null, violation = null) {
    const update = { status };
    if (returnDate) update.returnDate = returnDate;
    if (violation) update.violation = violation;
    
    return await this.model.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );
  }

  async getStatistics() {
    const now = new Date();
    const stats = await this.model.aggregate([
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],
          overdueFromBorrowed: [
            {
              $match: {
                status: "borrowed",
                dueDate: { $lt: now }
              }
            },
            { $count: "count" }
          ]
        }
      }
    ]);

    const result = {
      pending: 0,
      borrowed: 0,
      returned: 0,
      overdue: 0,
      rejected: 0,
      approved: 0
    };

    const counts = stats[0].counts;
    counts.forEach(s => {
      if (result.hasOwnProperty(s._id)) {
        result[s._id] = s.count;
      }
    });

    // Add items that are borrowed but past due date to overdue count
    // And subtract them from borrowed count to be accurate
    const dynamicOverdue = stats[0].overdueFromBorrowed[0]?.count || 0;
    result.overdue += dynamicOverdue;
    result.borrowed = Math.max(0, result.borrowed - dynamicOverdue);

    return result;
  }
}

module.exports = BorrowRepository;
