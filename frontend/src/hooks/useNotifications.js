import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import notificationService from '@/services/notificationService';
import useUIStore from '@/store/uiStore';
import { getSocket } from '@/services/socket';

const useNotifications = () => {
  const queryClient = useQueryClient();
  const { setUnreadCount, addNotification } = useUIStore();

  // Fetch notifications
  const { data: notifications } = useQuery(
    'notifications',
    () => notificationService.getAll({ limit: 50 }),
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  // Fetch unread count
  const { data: unreadCountData } = useQuery(
    'unreadCount',
    notificationService.getUnreadCount,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Mark as read mutation
  const markAsReadMutation = useMutation(notificationService.markAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unreadCount');
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation(notificationService.markAllAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unreadCount');
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation(notificationService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unreadCount');
    },
  });

  // Update unread count in UI store
  useEffect(() => {
    if (unreadCountData?.data?.count !== undefined) {
      setUnreadCount(unreadCountData.data.count);
    }
  }, [unreadCountData, setUnreadCount]);

  // Listen for real-time notifications via Socket.io
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('notification', (notification) => {
        addNotification(notification);
        queryClient.invalidateQueries('notifications');
        queryClient.invalidateQueries('unreadCount');
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [addNotification, queryClient]);

  return {
    notifications: notifications?.data || [],
    unreadCount: unreadCountData?.data?.count || 0,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
  };
};

export default useNotifications;