import axios from 'axios';
import { toast } from 'react-toastify';
import {
  getErrorMessage,
  getErrorType,
  shouldRetry,
  logError,
  ERROR_TYPES
} from './errorHandler';

const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        logError(error, 'Auth Data Parse');
      }
    }

    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    logError(error, 'Request Interceptor');
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorType = getErrorType(error);

    // Log all errors for debugging
    logError(error, 'API Response');

    // Handle 401 errors (Unauthorized) - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const { state } = JSON.parse(authData);
          if (state?.refreshToken) {
            // Use axios directly to avoid infinite loops
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
              refreshToken: state.refreshToken,
            });

            const { token, refreshToken } = response.data.data;

            // Update localStorage
            const updatedAuthData = {
              ...JSON.parse(authData),
              state: {
                ...state,
                token,
                refreshToken,
              },
            };
            localStorage.setItem('auth-storage', JSON.stringify(updatedAuthData));

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        logError(refreshError, 'Token Refresh');
        // Refresh failed, logout user
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle specific error types with appropriate messages
    const errorMessage = getErrorMessage(error);

    switch (errorType) {
      case ERROR_TYPES.TIMEOUT:
        toast.error(errorMessage);
        break;

      case ERROR_TYPES.NETWORK:
        toast.error(errorMessage);
        break;

      case ERROR_TYPES.CORS:
        logError(error, 'CORS Error');
        toast.error(errorMessage);
        break;

      case ERROR_TYPES.VALIDATION_ERROR:
        // Don't show toast for validation errors - let component handle it
        break;

      case ERROR_TYPES.UNAUTHORIZED:
        // Already handled above
        break;

      case ERROR_TYPES.FORBIDDEN:
        toast.error(errorMessage);
        break;

      case ERROR_TYPES.NOT_FOUND:
        // Usually not critical - let component decide
        break;

      case ERROR_TYPES.SERVER_ERROR:
        toast.error(errorMessage);
        break;

      default:
        if (error.response?.status !== 401 && error.response?.status !== 422) {
          toast.error(errorMessage);
        }
    }

    return Promise.reject(error);
  }
);

// Helper functions
export const get = (url, config = {}) => apiClient.get(url, config);
export const post = (url, data, config = {}) => apiClient.post(url, data, config);
export const put = (url, data, config = {}) => apiClient.put(url, data, config);
export const patch = (url, data, config = {}) => apiClient.patch(url, data, config);
export const del = (url, config = {}) => apiClient.delete(url, config);

export default apiClient;