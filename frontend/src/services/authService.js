import apiClient from '../utils/apiClient';
import { logError } from '../utils/errorHandler';

const authService = {
  // Register
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - Register');
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - Login');
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - Logout');
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - VerifyEmail');
      throw error;
    }
  },

  // Resend verification
  resendVerification: async (email) => {
    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - ResendVerification');
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - ForgotPassword');
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await apiClient.put(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - ResetPassword');
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - GetCurrentUser');
      throw error;
    }
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put('/auth/update-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - UpdatePassword');
      throw error;
    }
  },

  // Enable 2FA
  enable2FA: async () => {
    try {
      const response = await apiClient.post('/auth/2fa/enable');
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - Enable2FA');
      throw error;
    }
  },

  // Verify 2FA
  verify2FA: async (token) => {
    try {
      const response = await apiClient.post('/auth/2fa/verify', { token });
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - Verify2FA');
      throw error;
    }
  },

  // Disable 2FA
  disable2FA: async (token) => {
    try {
      const response = await apiClient.post('/auth/2fa/disable', { token });
      return response.data;
    } catch (error) {
      logError(error, 'AuthService - Disable2FA');
      throw error;
    }
  },

  // Google OAuth
  googleAuth: () => {
    try {
      const baseURL = apiClient.defaults.baseURL;
      if (!baseURL) {
        throw new Error('API base URL is not configured');
      }
      window.location.href = `${baseURL}/auth/google`;
    } catch (error) {
      logError(error, 'AuthService - GoogleAuth');
      throw error;
    }
  },

  // Facebook OAuth
  facebookAuth: () => {
    try {
      const baseURL = apiClient.defaults.baseURL;
      if (!baseURL) {
        throw new Error('API base URL is not configured');
      }
      window.location.href = `${baseURL}/auth/facebook`;
    } catch (error) {
      logError(error, 'AuthService - FacebookAuth');
      throw error;
    }
  },

  // LinkedIn OAuth
  linkedinAuth: () => {
    try {
      const baseURL = apiClient.defaults.baseURL;
      if (!baseURL) {
        throw new Error('API base URL is not configured');
      }
      window.location.href = `${baseURL}/auth/linkedin`;
    } catch (error) {
      logError(error, 'AuthService - LinkedinAuth');
      throw error;
    }
  },
};

export default authService;