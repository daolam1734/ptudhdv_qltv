const BaseRepository = require('../utils/BaseRepository');

class ViolationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async findByReader(readerId) {
    return await this.model.find({ readerId }).sort({ createdAt: -1 });
  }

  async findUnpaidByReader(readerId) {
    return await this.model.find({ 
      readerId, 
      status: { $in: ['unpaid', 'chưa thanh toán'] } 
    });
  }
}

module.exports = ViolationRepository;
