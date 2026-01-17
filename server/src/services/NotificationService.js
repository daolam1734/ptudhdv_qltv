const BaseService = require('../utils/BaseService');

class NotificationService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async createNotification(data) {
    /**
     * data: { recipient, title, message, type, relatedId, onModel }
     */
    return await this.repository.create(data);
  }

  async getMyNotifications(readerId, query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;

    return await this.repository.findByRecipient(readerId, { page, limit });
  }

  async markAsRead(notificationId, readerId) {
    const notification = await this.repository.findById(notificationId);
    if (!notification) throw new Error('Không tìm thấy thông báo');
    
    if (notification.recipient.toString() !== readerId.toString()) {
      throw new Error('Bạn không có quyền cập nhật thông báo này');
    }

    return await this.repository.update(notificationId, { isRead: true });
  }

  async markAllRead(readerId) {
    return await this.repository.markAllAsRead(readerId);
  }

  async getUnreadCount(readerId) {
    const count = await this.repository.getUnreadCount(readerId);
    return { unreadCount: count };
  }

  // Helper patterns for common notifications
  async notifyBorrowStatus(readerId, borrowId, status, bookTitles = []) {
    let title = '';
    let message = '';
    const booksStr = bookTitles.length > 0 ? ` cho các cuốn: ${bookTitles.join(', ')}` : '';

    switch (status) {
      case 'approved':
      case 'đã duyệt':
        title = 'Yêu cầu mượn sách đã được duyệt';
        message = `Thủ thư đã duyệt yêu cầu mượn sách của bạn${booksStr}. Vui lòng đến thư viện nhận sách trong vòng 24h.`;
        break;
      case 'borrowed':
      case 'đang mượn':
        title = 'Phát sách thành công';
        message = `Bạn đã nhận sách thành công${booksStr}. Hạn trả là ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}.`;
        break;
      case 'returned':
      case 'đã trả':
        title = 'Trả sách thành công';
        message = `Hệ thống ghi nhận bạn đã trả sách${booksStr} thành công. Cảm ơn bạn!`;
        break;
      case 'đã trả (vi phạm)':
        title = 'Trả sách (Có phát sinh vi phạm)';
        message = `Bạn đã trả sách${booksStr}. Hệ thống ghi nhận có vi phạm phát sinh, vui lòng kiểm tra chi tiết phí phạt.`;
        break;
      case 'rejected':
      case 'từ chối':
        title = 'Yêu cầu mượn sách bị từ chối';
        message = `Rất tiếc, yêu cầu mượn sách của bạn${booksStr} đã bị từ chối. Vui lòng liên hệ thủ thư để biết thêm chi tiết.`;
        break;
    }

    if (title && message) {
      return await this.createNotification({
        recipient: readerId,
        title,
        message,
        type: 'borrow',
        relatedId: borrowId,
        onModel: 'Borrow'
      });
    }
  }

  async notifyViolation(readerId, violationId, amount, reason, isPaymentConfirmed = false) {
    if (isPaymentConfirmed) {
      return await this.createNotification({
        recipient: readerId,
        title: 'Xác nhận thanh toán',
        message: `Hệ thống xác nhận bạn đã thanh toán khoản phí ${amount.toLocaleString()}đ cho nội dung: ${reason}. Cảm ơn bạn!`,
        type: 'violation',
        relatedId: violationId,
        onModel: 'Violation'
      });
    }

    return await this.createNotification({
      recipient: readerId,
      title: 'Ghi nhận vi phạm mới',
      message: `Bạn có một khoản phí phạt mới trị giá ${amount.toLocaleString()}đ với lý do: ${reason}.`,
      type: 'violation',
      relatedId: violationId,
      onModel: 'Violation'
    });
  }
}

module.exports = NotificationService;
