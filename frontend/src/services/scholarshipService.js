import apiClient from '../utils/apiClient';
import { logError } from '../utils/errorHandler';

const scholarshipService = {
  // Get all scholarships
  getAll: async (params) => {
    try {
      const response = await apiClient.get('/scholarships', { params });
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - GetAll');
      throw error;
    }
  },

  // Search scholarships
  search: async (filters) => {
    try {
      const response = await apiClient.get('/scholarships/search', { params: filters });
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - Search');
      throw error;
    }
  },

  // Get scholarship by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/scholarships/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - GetById');
      throw error;
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const response = await apiClient.get('/scholarships/filter-options');
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - GetFilterOptions');
      throw error;
    }
  },

  // Get upcoming deadlines
  getUpcomingDeadlines: async () => {
    try {
      const response = await apiClient.get('/scholarships/upcoming-deadlines');
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - GetUpcomingDeadlines');
      throw error;
    }
  },

  // Get recommended scholarships
  getRecommended: async () => {
    try {
      const response = await apiClient.get('/scholarships/user/recommended');
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - GetRecommended');
      throw error;
    }
  },

  // Get saved scholarships
  getSaved: async () => {
    try {
      const response = await apiClient.get('/scholarships/user/saved');
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - GetSaved');
      throw error;
    }
  },

  // Save scholarship
  save: async (id) => {
    try {
      const response = await apiClient.post(`/scholarships/${id}/save`);
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - Save');
      throw error;
    }
  },

  // Unsave scholarship
  unsave: async (id) => {
    try {
      const response = await apiClient.delete(`/scholarships/${id}/save`);
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - Unsave');
      throw error;
    }
  },

  // Admin: Create scholarship
  create: async (data) => {
    try {
      const response = await apiClient.post('/scholarships', data);
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - Create');
      throw error;
    }
  },

  // Admin: Update scholarship
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/scholarships/${id}`, data);
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - Update');
      throw error;
    }
  },

  // Admin: Delete scholarship
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/scholarships/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'ScholarshipService - Delete');
      throw error;
    }
  },
};

export default scholarshipService;