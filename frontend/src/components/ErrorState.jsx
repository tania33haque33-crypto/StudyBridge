/**
 * Error State Component
 * Displays a user-friendly error message with retry functionality
 */

import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorState = ({
  error,
  onRetry,
  title = 'Something went wrong',
  message,
  showIcon = true,
  fullHeight = false,
}) => {
  const errorMessage = message || error?.response?.data?.message || error?.message || 'An unexpected error occurred';

  return (
    <Paper
      sx={{
        p: 3,
        textAlign: 'center',
        height: fullHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        border: '1px solid #f0f0f0',
      }}
    >
      {showIcon && (
        <ErrorOutlineIcon
          sx={{
            fontSize: 48,
            color: 'error.main',
            mb: 2,
          }}
        />
      )}

      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 3, maxWidth: 400 }}>
        {errorMessage}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          onClick={onRetry}
          sx={{ textTransform: 'capitalize' }}
        >
          Try Again
        </Button>
      )}
    </Paper>
  );
};

export default ErrorState;
