import apiClient from '../utils/apiClient';
import { logError } from '../utils/errorHandler';

const userService = {
  // Get profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      logError(error, 'UserService - GetProfile');
      throw error;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/users/profile', data);
      return response.data;
    } catch (error) {
      logError(error, 'UserService - UpdateProfile');
      throw error;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await apiClient.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      logError(error, 'UserService - UploadProfilePicture');
      throw error;
    }
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    try {
      const response = await apiClient.delete('/users/profile/picture');
      return response.data;
    } catch (error) {
      logError(error, 'UserService - DeleteProfilePicture');
      throw error;
    }
  },

  // Get saved universities
  getSavedUniversities: async () => {
    try {
      const response = await apiClient.get('/users/saved-universities');
      return response.data;
    } catch (error) {
      logError(error, 'UserService - GetSavedUniversities');
      throw error;
    }
  },

  // Save university
  saveUniversity: async (universityId) => {
    try {
      const response = await apiClient.post(`/users/saved-universities/${universityId}`);
      return response.data;
    } catch (error) {
      logError(error, 'UserService - SaveUniversity');
      throw error;
    }
  },

  // Unsave university
  unsaveUniversity: async (universityId) => {
    try {
      const response = await apiClient.delete(`/users/saved-universities/${universityId}`);
      return response.data;
    } catch (error) {
      logError(error, 'UserService - UnsaveUniversity');
      throw error;
    }
  },

  // Get saved searches
  getSavedSearches: async () => {
    try {
      const response = await apiClient.get('/users/saved-searches');
      return response.data;
    } catch (error) {
      logError(error, 'UserService - GetSavedSearches');
      throw error;
    }
  },

  // Save search
  saveSearch: async (data) => {
    try {
      const response = await apiClient.post('/users/saved-searches', data);
      return response.data;
    } catch (error) {
      logError(error, 'UserService - SaveSearch');
      throw error;
    }
  },

  // Delete search
  deleteSearch: async (searchId) => {
    try {
      const response = await apiClient.delete(`/users/saved-searches/${searchId}`);
      return response.data;
    } catch (error) {
      logError(error, 'UserService - DeleteSearch');
      throw error;
    }
  },

  // Update preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await apiClient.put('/users/preferences', preferences);
      return response.data;
    } catch (error) {
      logError(error, 'UserService - UpdatePreferences');
      throw error;
    }
  },

  // Get recommendations
  getRecommendations: async () => {
    try {
      const response = await apiClient.get('/users/recommendations');
      return response.data;
    } catch (error) {
      logError(error, 'UserService - GetRecommendations');
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const response = await apiClient.delete('/users/account', { data: { password } });
      return response.data;
    } catch (error) {
      logError(error, 'UserService - DeleteAccount');
      throw error;
    }
  },
};

export default userService;