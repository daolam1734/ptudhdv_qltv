const asyncHandler = require("../middlewares/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

class NotificationController {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  getMyNotifications = asyncHandler(async (req, res) => {
    const readerId = req.user.id;
    const result = await this.notificationService.getMyNotifications(readerId, req.query);
    return res.status(200).json(new ApiResponse(200, result, "Lấy danh sách thông báo thành công"));
  });

  getUnreadCount = asyncHandler(async (req, res) => {
    const readerId = req.user.id;
    const result = await this.notificationService.getUnreadCount(readerId);
    return res.status(200).json(new ApiResponse(200, result, "Lấy số lượng thông báo chưa đọc thành công"));
  });

  markAsRead = asyncHandler(async (req, res) => {
    const readerId = req.user.id;
    const { id } = req.params;
    await this.notificationService.markAsRead(id, readerId);
    return res.status(200).json(new ApiResponse(200, null, "Đã đánh dấu thông báo là đã đọc"));
  });

  markAllRead = asyncHandler(async (req, res) => {
    const readerId = req.user.id;
    await this.notificationService.markAllRead(readerId);
    return res.status(200).json(new ApiResponse(200, null, "Đã đánh dấu tất cả thông báo là đã đọc"));
  });
}

module.exports = NotificationController;
