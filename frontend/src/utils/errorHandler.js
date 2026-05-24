/**
 * Centralized error handling utility
 * Converts error objects to user-friendly messages and classifies error types
 */

export const ERROR_TYPES = {
  TIMEOUT: 'TIMEOUT',
  CORS: 'CORS',
  NETWORK: 'NETWORK',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Get user-friendly error message from error object
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  // Handle API error responses
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Custom message from server
    if (data?.message) return data.message;
    if (data?.error) return data.error;

    // Standard HTTP status codes
    switch (status) {
      case 400:
        return data?.details || 'Invalid request. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return data?.details || 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server error. Please try again later.';
      default:
        return `Error (${status}): ${data?.message || 'Please try again.'}`;
    }
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message === 'timeout of 30000ms exceeded') {
    return 'Request timed out. Please check your connection and try again.';
  }

  // Handle network errors
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your internet connection.';
  }

  // Handle CORS errors
  if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
    return 'Cross-origin request failed. This is usually a server configuration issue.';
  }

  // Generic messages
  if (error.message) return error.message;
  if (typeof error === 'string') return error;

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Classify the type of error
 * @param {Error} error - The error object
 * @returns {string} Error type from ERROR_TYPES
 */
export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Timeout
  if (error.code === 'ECONNABORTED' || error.message === 'timeout of 30000ms exceeded') {
    return ERROR_TYPES.TIMEOUT;
  }

  // Network errors
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return ERROR_TYPES.NETWORK;
  }

  // CORS errors
  if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
    return ERROR_TYPES.CORS;
  }

  // HTTP response errors
  if (error.response) {
    const status = error.response.status;
    if (status === 401 || status === 419) return ERROR_TYPES.UNAUTHORIZED;
    if (status === 403) return ERROR_TYPES.FORBIDDEN;
    if (status === 404) return ERROR_TYPES.NOT_FOUND;
    if (status === 422 || status === 400) return ERROR_TYPES.VALIDATION_ERROR;
    if (status >= 500) return ERROR_TYPES.SERVER_ERROR;
  }

  return ERROR_TYPES.UNKNOWN;
};

/**
 * Determine if an error should trigger a retry
 * @param {Error} error - The error object
 * @returns {boolean} Whether the error should be retried
 */
export const shouldRetry = (error) => {
  if (!error) return false;

  const errorType = getErrorType(error);

  // Retry on network and timeout errors
  if (
    errorType === ERROR_TYPES.NETWORK ||
    errorType === ERROR_TYPES.TIMEOUT
  ) {
    return true;
  }

  // Retry on server errors (5xx)
  if (error.response?.status >= 500) {
    return true;
  }

  // Retry on 429 (rate limit)
  if (error.response?.status === 429) {
    return true;
  }

  // Don't retry client errors (4xx except 429)
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return false;
  }

  return false;
};

/**
 * Log error for debugging
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = 'Unknown') => {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);

  console.error(`[${context}] ${errorType}:`, {
    message: errorMessage,
    type: errorType,
    originalError: error,
    timestamp: new Date().toISOString()
  });
};

/**
 * Extract validation errors from response
 * @param {Error} error - The error object
 * @returns {Object} Object with field errors
 */
export const getValidationErrors = (error) => {
  if (!error?.response?.data?.errors) {
    return {};
  }

  const errors = {};
  const errorData = error.response.data.errors;

  if (Array.isArray(errorData)) {
    errorData.forEach((err) => {
      if (err.field) {
        errors[err.field] = err.message;
      }
    });
  } else if (typeof errorData === 'object') {
    return errorData;
  }

  return errors;
};

/**
 * Check if error is a validation error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  return error?.response?.status === 422 || error?.response?.status === 400;
};

/**
 * Check if error is an authentication error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error?.response?.status === 401 || error?.response?.status === 419;
};

/**
 * Check if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return getErrorType(error) === ERROR_TYPES.NETWORK;
};

/**
 * Check if error is a timeout error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isTimeoutError = (error) => {
  return getErrorType(error) === ERROR_TYPES.TIMEOUT;
};
