/**
 * Error Boundary Component
 * Catches errors in component tree and displays error UI
 */

import React from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { logError } from '../utils/errorHandler';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, 'Error Boundary');

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // If too many errors, show different message
      if (this.state.errorCount > 3) {
        return (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" color="warning.dark" sx={{ mb: 1 }}>
              Something is Seriously Wrong
            </Typography>
            <Typography variant="body2" color="warning.dark" sx={{ mb: 2 }}>
              Please refresh the page or contact support if the problem persists.
            </Typography>
            <Button
              variant="contained"
              color="warning"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Box>
        );
      }

      return (
        <Paper
          sx={{
            p: 3,
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <ErrorOutlineIcon sx={{ color: 'error.main', fontSize: 32, mt: 0.5 }} />

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h2" sx={{ color: 'error.main', mb: 1 }}>
                {this.props.title || 'Oops! Something went wrong'}
              </Typography>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {this.props.message || 'An unexpected error occurred while rendering this page.'}
              </Typography>

              {this.props.showDetails && this.state.error && (
                <Box
                  sx={{
                    p: 1,
                    mb: 2,
                    backgroundColor: '#fff',
                    border: '1px solid #f44336',
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 150,
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      color: '#d32f2f',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}
                  >
                    {this.state.error.toString()}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={this.handleReset}
                  size="small"
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => (window.location.href = '/')}
                  size="small"
                >
                  Go Home
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
