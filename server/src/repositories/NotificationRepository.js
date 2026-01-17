const BaseRepository = require('../utils/BaseRepository');

class NotificationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async findByRecipient(recipientId, options = {}) {
    const { limit = 20, page = 1 } = options;
    const skip = (page - 1) * limit;

    const query = { recipient: recipientId };
    
    const data = await this.model.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.model.countDocuments(query);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async markAllAsRead(recipientId) {
    return await this.model.updateMany(
      { recipient: recipientId, isRead: false },
      { $set: { isRead: true } }
    );
  }

  async getUnreadCount(recipientId) {
    return await this.model.countDocuments({ recipient: recipientId, isRead: false });
  }
}

module.exports = NotificationRepository;
