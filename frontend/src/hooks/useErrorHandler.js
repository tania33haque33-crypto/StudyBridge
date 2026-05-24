/**
 * React hook for consistent error handling across components
 */

import { useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getErrorMessage,
  getErrorType,
  logError,
  getValidationErrors,
  isValidationError,
  isAuthError
} from '../utils/errorHandler';

/**
 * Hook for handling errors in components
 * @param {string} context - Context for error logging
 * @param {Function} onAuthError - Callback for auth errors (e.g., redirect to login)
 * @returns {Object} Error handling utilities
 */
export const useErrorHandler = (context = 'Component', onAuthError = null) => {
  /**
   * Handle error and show toast notification
   */
  const handleError = useCallback((error, showToast = true) => {
    logError(error, context);

    // Handle auth errors
    if (isAuthError(error)) {
      toast.error('Your session has expired. Please log in again.');
      if (onAuthError) {
        onAuthError();
      }
      return;
    }

    // Show error message
    if (showToast) {
      const message = getErrorMessage(error);
      toast.error(message);
    }

    return error;
  }, [context, onAuthError]);

  /**
   * Handle validation error with field-specific messages
   */
  const handleValidationError = useCallback((error) => {
    logError(error, `${context} - Validation`);

    if (isValidationError(error)) {
      const errors = getValidationErrors(error);
      return errors;
    }

    return {};
  }, [context]);

  /**
   * Handle error and return user-friendly message
   */
  const getError = useCallback((error) => {
    return getErrorMessage(error);
  }, []);

  /**
   * Get error type for conditional rendering
   */
  const getType = useCallback((error) => {
    return getErrorType(error);
  }, []);

  return {
    handleError,
    handleValidationError,
    getError,
    getType
  };
};

export default useErrorHandler;
