import apiClient from '../utils/apiClient';
import { logError } from '../utils/errorHandler';

const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - GetDashboardStats');
      throw error;
    }
  },

  getUniversityStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/university-stats');
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - GetUniversityStats');
      throw error;
    }
  },

  getApplicationStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/application-stats');
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - GetApplicationStats');
      throw error;
    }
  },

  // User Management
  getAllUsers: async (params) => {
    try {
      const response = await apiClient.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - GetAllUsers');
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - GetUserById');
      throw error;
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - UpdateUserRole');
      throw error;
    }
  },

  suspendUser: async (id, reason) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/suspend`, { reason });
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - SuspendUser');
      throw error;
    }
  },

  unsuspendUser: async (id) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/unsuspend`);
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - UnsuspendUser');
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - DeleteUser');
      throw error;
    }
  },

  verifyUser: async (id) => {
    try {
      const response = await apiClient.patch(`/admin/users/${id}/verify`);
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - VerifyUser');
      throw error;
    }
  },

  // System
  getSystemHealth: async () => {
    try {
      const response = await apiClient.get('/admin/system/health');
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - GetSystemHealth');
      throw error;
    }
  },

  sendBulkEmail: async (data) => {
    try {
      const response = await apiClient.post('/admin/bulk-email', data);
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - SendBulkEmail');
      throw error;
    }
  },

  exportData: async (type) => {
    try {
      const response = await apiClient.post('/admin/export-data', { type });
      return response.data;
    } catch (error) {
      logError(error, 'AdminService - ExportData');
      throw error;
    }
  },
};

export default adminService;