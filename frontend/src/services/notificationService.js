import apiClient from '../utils/apiClient';
import { logError } from '../utils/errorHandler';

const notificationService = {
  // Get notifications
  getAll: async (params) => {
    try {
      const response = await apiClient.get('/notifications', { params });
      return response.data;
    } catch (error) {
      logError(error, 'NotificationService - GetAll');
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      logError(error, 'NotificationService - GetUnreadCount');
      throw error;
    }
  },

  // Mark as read
  markAsRead: async (id) => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      logError(error, 'NotificationService - MarkAsRead');
      throw error;
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.patch('/notifications/read-all');
      return response.data;
    } catch (error) {
      logError(error, 'NotificationService - MarkAllAsRead');
      throw error;
    }
  },

  // Delete notification
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'NotificationService - Delete');
      throw error;
    }
  },

  // Delete all read
  deleteAllRead: async () => {
    try {
      const response = await apiClient.delete('/notifications/read/all');
      return response.data;
    } catch (error) {
      logError(error, 'NotificationService - DeleteAllRead');
      throw error;
    }
  },

  // Update notification settings
  updateSettings: async (settings) => {
    try {
      const response = await apiClient.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      logError(error, 'NotificationService - UpdateSettings');
      throw error;
    }
  },
};

export default notificationService;