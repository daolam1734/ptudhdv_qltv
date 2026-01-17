import axiosInstance from '../utils/axiosInstance';

const notificationService = {
  getMyNotifications: async (params) => {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await axiosInstance.put('/notifications/mark-all-read');
    return response.data;
  }
};

export default notificationService;
