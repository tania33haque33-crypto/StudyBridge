import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Button,
  Chip,
  Menu,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  DoneAll as MarkReadIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  CardGiftcard as ScholarshipIcon,
  Description as ApplicationIcon,
  Event as DeadlineIcon,
  Announcement as AnnouncementIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import notificationService from '@/services/notificationService';
import { formatRelativeTime } from '@/utils/formatters';

const getNotificationIcon = (type) => {
  const icons = {
    application: <ApplicationIcon />,
    deadline: <DeadlineIcon />,
    scholarship: <ScholarshipIcon />,
    announcement: <AnnouncementIcon />,
    university: <SchoolIcon />,
  };
  return icons[type] || <NotificationIcon />;
};

const getNotificationColor = (type) => {
  const colors = {
    application: 'primary',
    deadline: 'error',
    scholarship: 'success',
    announcement: 'info',
    university: 'warning',
  };
  return colors[type] || 'default';
};

const Notifications = () => {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data: notifications, isLoading } = useQuery('notifications', () =>
    notificationService.getAll({ isRead: filter === 'unread' ? false : undefined })
  );

  const markAsReadMutation = useMutation(notificationService.markAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unreadCount');
    },
  });

  const markAllReadMutation = useMutation(notificationService.markAllAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      queryClient.invalidateQueries('unreadCount');
      toast.success('All notifications marked as read');
    },
  });

  const deleteMutation = useMutation(notificationService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      toast.success('Notification deleted');
    },
  });

  const deleteAllReadMutation = useMutation(notificationService.deleteAllRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
      toast.success('All read notifications deleted');
    },
  });

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = () => {
    if (selectedNotification && !selectedNotification.isRead) {
      markAsReadMutation.mutate(selectedNotification._id);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedNotification) {
      deleteMutation.mutate(selectedNotification._id);
    }
    handleMenuClose();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications - StudyBridge</title>
      </Helmet>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with your applications and deadlines
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<MarkReadIcon />}
              onClick={() => markAllReadMutation.mutate()}
            >
              Mark All Read
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => deleteAllReadMutation.mutate()}
            >
              Clear Read
            </Button>
          </Stack>
        </Box>

        {/* Filter Chips */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip
            label="All"
            color={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
          />
          <Chip
            label="Unread"
            color={filter === 'unread' ? 'primary' : 'default'}
            onClick={() => setFilter('unread')}
          />
        </Stack>

        <Card>
          <List sx={{ p: 0 }}>
            {isLoading ? (
              <ListItem>
                <ListItemText primary="Loading notifications..." />
              </ListItem>
            ) : notifications?.data?.length > 0 ? (
              notifications.data.map((notification, index) => (
                <Box key={notification._id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                    onClick={() => handleNotificationClick(notification)}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, notification);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.main` }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={notification.isRead ? 400 : 700}>
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatRelativeTime(notification.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.data.length - 1 && <Divider />}
                </Box>
              ))
            ) : (
              <ListItem sx={{ py: 8, textAlign: 'center', flexDirection: 'column' }}>
                <NotificationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up!
                </Typography>
              </ListItem>
            )}
          </List>
        </Card>

        {/* Action Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {selectedNotification && !selectedNotification.isRead && (
            <MenuItem onClick={handleMarkAsRead}>
              <MarkReadIcon sx={{ mr: 1 }} fontSize="small" />
              Mark as Read
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
};

export default Notifications;