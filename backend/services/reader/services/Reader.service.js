const BaseService = require('../../../shared/base/BaseService');

class ReaderService extends BaseService {
    constructor(repository) {
        super(repository);
        this.borrowService = null;
    }

    setBorrowService(borrowService) {
        this.borrowService = borrowService;
    }

    async getAllReaders(filter = {}, options = {}) {
        const { status, membershipType, search } = filter;

        const query = {};
        if (status) query.status = status;
        if (membershipType) query.membershipType = membershipType;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { idCard: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        return await this.repository.findAll(query, options);
    }

    async updateReader(id, data) {
        // Prevent some fields from being updated directly through here if needed
        delete data.password;
        delete data.role;
        delete data.username;

        const reader = await this.repository.update(id, data);
        if (!reader) {
            throw new Error('Reader not found');
        }
        return reader;
    }

    // Placeholder for history - will be populated from Borrow Service via Controller or internal call
    async getBorrowHistory(readerId) {
        if (!this.borrowService) {
            return [];
        }
        return await this.borrowService.getReaderHistory(readerId);
    }
}

module.exports = ReaderService;
