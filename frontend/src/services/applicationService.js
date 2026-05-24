import api, { get, post, put, patch, del } from '../utils/apiClient';
import { logError } from '../utils/errorHandler';

export { get, post, put, patch, del };

export const applicationService = {
  // Create application
  create: async (data) => {
    try {
      const response = await api.post('/applications', data);
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - Create');
      throw error;
    }
  },

  // Get all applications
  getAll: async (params) => {
    try {
      const response = await api.get('/applications', { params });
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - GetAll');
      throw error;
    }
  },

  // Get application by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - GetById');
      throw error;
    }
  },

  // Update application
  update: async (id, data) => {
    try {
      const response = await api.put(`/applications/${id}`, data);
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - Update');
      throw error;
    }
  },

  // Delete application
  delete: async (id) => {
    try {
      const response = await api.delete(`/applications/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - Delete');
      throw error;
    }
  },

  // Update status
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/applications/${id}/status`, { status });
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - UpdateStatus');
      throw error;
    }
  },

  // Upload document
  uploadDocument: async (id, file, type) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      const response = await api.post(`/applications/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - UploadDocument');
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (id, documentId) => {
    try {
      const response = await api.delete(`/applications/${id}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - DeleteDocument');
      throw error;
    }
  },

  // Add note
  addNote: async (id, content) => {
    try {
      const response = await api.post(`/applications/${id}/notes`, { content });
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - AddNote');
      throw error;
    }
  },

  // Get timeline
  getTimeline: async (id) => {
    try {
      const response = await api.get(`/applications/${id}/timeline`);
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - GetTimeline');
      throw error;
    }
  },

  // Check eligibility
  checkEligibility: async (data) => {
    try {
      const response = await api.post('/applications/check-eligibility', data);
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - CheckEligibility');
      throw error;
    }
  },

  // Generate document checklist
  generateChecklist: async (data) => {
    try {
      const response = await api.post('/applications/document-checklist', data);
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - GenerateChecklist');
      throw error;
    }
  },

  // Get stats
  getStats: async () => {
    try {
      const response = await api.get('/applications/stats');
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - GetStats');
      throw error;
    }
  },

  // Get upcoming deadlines
  getUpcomingDeadlines: async () => {
    try {
      const response = await api.get('/applications/upcoming-deadlines');
      return response.data;
    } catch (error) {
      logError(error, 'ApplicationService - GetUpcomingDeadlines');
      throw error;
    }
  },
};

// Default export is the axios client for backward compatibility with services that use api.get/post/etc
export default api;