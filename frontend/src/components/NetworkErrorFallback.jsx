/**
 * Network Error Fallback Component
 * Displays when network is unavailable
 */

import React from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const NetworkErrorFallback = ({ onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        p: 3,
      }}
    >
      <Alert severity="error" sx={{ mb: 3, maxWidth: 500 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Network Connection Lost
        </Typography>
        <Typography variant="body2">
          It looks like you've lost your internet connection. Please check your connection and try again.
        </Typography>
      </Alert>

      <WifiOffIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />

      <Typography variant="h6" component="h2" sx={{ mb: 1, textAlign: 'center' }}>
        Unable to Connect
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center', maxWidth: 400 }}>
        We're unable to reach the server. Please check your internet connection and try again.
      </Typography>

      {onRetry && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={onRetry}>
            Retry
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default NetworkErrorFallback;
