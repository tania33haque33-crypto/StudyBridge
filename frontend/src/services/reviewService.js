import apiClient from '../utils/apiClient';
import { logError } from '../utils/errorHandler';

const reviewService = {
  // Get reviews by university
  getByUniversity: async (universityId, params) => {
    try {
      const response = await apiClient.get(`/reviews/university/${universityId}`, { params });
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - GetByUniversity');
      throw error;
    }
  },

  // Get review by ID
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - GetById');
      throw error;
    }
  },

  // Create review
  create: async (data) => {
    try {
      const response = await apiClient.post('/reviews', data);
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - Create');
      throw error;
    }
  },

  // Update review
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/reviews/${id}`, data);
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - Update');
      throw error;
    }
  },

  // Delete review
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - Delete');
      throw error;
    }
  },

  // Mark review as helpful
  markHelpful: async (id) => {
    try {
      const response = await apiClient.post(`/reviews/${id}/helpful`);
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - MarkHelpful');
      throw error;
    }
  },

  // Report review
  report: async (id, reason) => {
    try {
      const response = await apiClient.post(`/reviews/${id}/report`, { reason });
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - Report');
      throw error;
    }
  },

  // Upload review photos
  uploadPhotos: async (id, files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('photos', file));
      const response = await apiClient.post(`/reviews/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - UploadPhotos');
      throw error;
    }
  },

  // Get my reviews
  getMyReviews: async () => {
    try {
      const response = await apiClient.get('/reviews/user/my-reviews');
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - GetMyReviews');
      throw error;
    }
  },

  // Admin: Get pending reviews
  getPending: async () => {
    try {
      const response = await apiClient.get('/reviews/admin/pending');
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - GetPending');
      throw error;
    }
  },

  // Admin: Approve review
  approve: async (id) => {
    try {
      const response = await apiClient.patch(`/reviews/${id}/approve`);
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - Approve');
      throw error;
    }
  },

  // Admin: Reject review
  reject: async (id, reason) => {
    try {
      const response = await apiClient.patch(`/reviews/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      logError(error, 'ReviewService - Reject');
      throw error;
    }
  },
};

export default reviewService;