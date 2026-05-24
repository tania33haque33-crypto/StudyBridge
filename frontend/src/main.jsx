import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';
import theme from './theme';
import { shouldRetry, logError } from './utils/errorHandler';
import './index.css';

// Exponential backoff retry delay function
const getRetryDelay = (attemptIndex) => {
  return Math.min(1000 * 2 ** attemptIndex, 30000);
};

// Create React Query client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Only retry if shouldRetry returns true
        if (!shouldRetry(error)) {
          return false;
        }
        // Retry up to 3 times
        return failureCount < 3;
      },
      retryDelay: getRetryDelay,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        // Log all query errors for debugging
        logError(error, 'React Query');
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Retry mutations based on error type
        if (!shouldRetry(error)) {
          return false;
        }
        // Retry up to 2 times for mutations (less aggressive than queries)
        return failureCount < 2;
      },
      retryDelay: getRetryDelay,
      onError: (error) => {
        // Log all mutation errors for debugging
        logError(error, 'React Query Mutation');
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);