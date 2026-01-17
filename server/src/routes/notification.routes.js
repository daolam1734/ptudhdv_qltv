const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

const notificationRoutes = (controller) => {
  // Tất cả các route thông báo đều yêu cầu đăng nhập
  router.use(protect);

  router.get('/', controller.getMyNotifications);
  router.get('/unread-count', controller.getUnreadCount);
  router.put('/mark-all-read', controller.markAllRead);
  router.put('/:id/read', controller.markAsRead);

  return router;
};

module.exports = notificationRoutes;
