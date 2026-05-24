import apiClient from '../utils/apiClient';
import { logError } from '../utils/errorHandler';

const universityService = {
  // Get all universities
  getAll: async (params) => {
    try {
      const response = await apiClient.get('/universities', { params });
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - GetAll');
      throw error;
    }
  },

  // Search universities
  search: async (filters) => {
    try {
      const response = await apiClient.get('/universities/search', { params: filters });
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - Search');
      throw error;
    }
  },

  // Get university by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/universities/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - GetById');
      throw error;
    }
  },

  // Get university by slug
  getBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/universities/slug/${slug}`);
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - GetBySlug');
      throw error;
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const response = await apiClient.get('/universities/filter-options');
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - GetFilterOptions');
      throw error;
    }
  },

  // Compare universities
  compare: async (universityIds) => {
    try {
      const response = await apiClient.post('/universities/compare', { universityIds });
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - Compare');
      throw error;
    }
  },

  // Get similar universities
  getSimilar: async (id) => {
    try {
      const response = await apiClient.get(`/universities/${id}/similar`);
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - GetSimilar');
      throw error;
    }
  },

  // Get popular universities
  getPopular: async () => {
    try {
      const response = await apiClient.get('/universities/popular');
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - GetPopular');
      throw error;
    }
  },

  // Get featured universities
  getFeatured: async () => {
    try {
      const response = await apiClient.get('/universities/featured');
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - GetFeatured');
      throw error;
    }
  },

  // Increment view count
  incrementView: async (id) => {
    try {
      const response = await apiClient.post(`/universities/${id}/view`);
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - IncrementView');
      throw error;
    }
  },

  // Admin: Create university
  create: async (data) => {
    try {
      const response = await apiClient.post('/universities', data);
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - Create');
      throw error;
    }
  },

  // Admin: Update university
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/universities/${id}`, data);
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - Update');
      throw error;
    }
  },

  // Admin: Delete university
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/universities/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - Delete');
      throw error;
    }
  },

  // Admin: Import from CSV
  importCSV: async (file) => {
    try {
      const formData = new FormData();
      formData.append('csv', file);
      const response = await apiClient.post('/universities/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      logError(error, 'UniversityService - ImportCSV');
      throw error;
    }
  },
};

export default universityService;