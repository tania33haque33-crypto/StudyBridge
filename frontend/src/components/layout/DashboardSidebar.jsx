import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  BookmarkBorder as BookmarkIcon,
  CardGiftcard as ScholarshipIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Forum as ForumIcon,
  TravelExplore as FinderIcon,
  People as CommunityIcon,
  ManageSearch as StudyProfileIcon,
  QuestionAnswer as MyDiscussionsIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'University Finder', icon: <FinderIcon />, path: '/university-finder' },
  { text: 'My Study Profile', icon: <StudyProfileIcon />, path: '/dashboard/study-profile' },
  { text: 'Student Community', icon: <CommunityIcon />, path: '/community' },
  { text: 'Applications', icon: <DescriptionIcon />, path: '/dashboard/applications' },
  { text: 'Saved Universities', icon: <SchoolIcon />, path: '/dashboard/saved-universities' },
  { text: 'Saved Scholarships', icon: <ScholarshipIcon />, path: '/dashboard/saved-scholarships' },
  { text: 'Discussions', icon: <ForumIcon />, path: '/discussions' },
  { text: 'My Discussions', icon: <MyDiscussionsIcon />, path: '/dashboard/my-discussions' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/dashboard/notifications' },
  { text: 'Profile', icon: <PersonIcon />, path: '/dashboard/profile' },
];

const DashboardSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, pt: 4 }}>
        <Typography variant="h6" fontWeight={700} color="text.secondary">
          Student Portal
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              top: 64,
              height: 'calc(100% - 64px)',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default DashboardSidebar;