const BaseRepository = require('../../../shared/base/BaseRepository');

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
}

module.exports = BorrowRepository;
