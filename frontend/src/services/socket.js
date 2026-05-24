import { io } from 'socket.io-client';
import useUIStore from '@/store/uiStore';
import { toast } from 'react-toastify';
import { logError } from '@/utils/errorHandler';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
  });

  // Handle successful connection
  socket.on('connect', () => {
    console.log('✅ Socket connected');
    reconnectAttempts = 0; // Reset counter on successful connection
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);

    // Notify user if it's not a normal disconnect
    if (reason !== 'io client namespace disconnect') {
      logError(new Error(`Socket disconnected: ${reason}`), 'Socket');
    }
  });

  // Handle connection errors
  socket.on('connect_error', (error) => {
    console.error('⚠️ Socket connection error:', error);
    logError(error, 'Socket Connection');

    reconnectAttempts += 1;

    // Show error message if reconnection attempts are exhausted
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      toast.error('Unable to connect to real-time notifications. Please refresh the page.');
    }
  });

  // Handle reconnection attempts
  socket.on('reconnect_attempt', () => {
    console.log(`Attempting to reconnect... (Attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
  });

  // Handle successful reconnection
  socket.on('reconnect', () => {
    console.log('🔄 Socket reconnected');
    reconnectAttempts = 0;
    toast.success('Real-time connection restored');
  });

  // Handle reconnection failure
  socket.on('reconnect_failed', () => {
    console.error('Reconnection failed');
    logError(new Error('Socket reconnection failed'), 'Socket');
    toast.error('Failed to reconnect to real-time notifications.');
  });

  // Handle notifications
  socket.on('notification', (data) => {
    try {
      useUIStore.getState().addNotification(data);

      // Show toast notification
      toast.info(data.message, {
        onClick: () => {
          if (data.actionUrl) {
            window.location.href = data.actionUrl;
          }
        },
      });
    } catch (error) {
      logError(error, 'Socket Notification Handler');
    }
  });

  // Handle application updates
  socket.on('application_update', (data) => {
    try {
      toast.success(`Application status updated: ${data.status}`);
    } catch (error) {
      logError(error, 'Socket Application Update Handler');
    }
  });

  // Handle deadline reminders
  socket.on('deadline_reminder', (data) => {
    try {
      toast.warning(data.message, {
        autoClose: 8000,
      });
    } catch (error) {
      logError(error, 'Socket Deadline Reminder Handler');
    }
  });

  // Handle scholarship alerts
  socket.on('scholarship_alert', (data) => {
    try {
      toast.info(data.message);
    } catch (error) {
      logError(error, 'Socket Scholarship Alert Handler');
    }
  });

  // Handle general socket errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    logError(error, 'Socket');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
  }
};

export const getSocket = () => socket;

export const isSocketConnected = () => socket?.connected || false;

export default {
  initializeSocket,
  disconnectSocket,
  getSocket,
  isSocketConnected,
};