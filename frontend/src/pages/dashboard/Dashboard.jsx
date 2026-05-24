import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  Stack,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  School as SchoolIcon,
  Description as ApplicationIcon,
  EventAvailable as DeadlineIcon,
  Notifications as NotificationIcon,
  TravelExplore as FinderIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import applicationService from '@/services/applicationService';
import universityService from '@/services/universityService';
import useAuthStore from '@/store/authStore';
import { formatDate, daysUntil } from '@/utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: stats } = useQuery('applicationStats', applicationService.getStats);
  const { data: upcomingDeadlines } = useQuery(
    'upcomingDeadlines',
    applicationService.getUpcomingDeadlines
  );
  const { data: recommendations } = useQuery(
    'recommendations',
    universityService.getPopular
  );

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.data?.total || 0,
      icon: <ApplicationIcon />,
      color: 'primary',
      change: '+12%',
    },
    {
      title: 'In Progress',
      value: stats?.data?.inProgress || 0,
      icon: <TrendingIcon />,
      color: 'warning',
      change: '+5%',
    },
    {
      title: 'Accepted',
      value: stats?.data?.accepted || 0,
      icon: <SchoolIcon />,
      color: 'success',
      change: '+8%',
    },
    {
      title: 'Upcoming Deadlines',
      value: upcomingDeadlines?.data?.length || 0,
      icon: <DeadlineIcon />,
      color: 'error',
      change: 'This week',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - StudyBridge</title>
      </Helmet>

      <Box>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your applications
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${card.color}.main` }}>{card.icon}</Avatar>
                    <Chip label={card.change} size="small" color={card.color} />
                  </Box>
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Application Progress */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Application Progress
                  </Typography>
                  <Button size="small" onClick={() => navigate('/dashboard/applications')}>
                    View All
                  </Button>
                </Box>

                {stats?.data?.byStatus?.map((item, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{item.status}</Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {item.count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.count / stats.data.total) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Recommended Universities */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Recommended for You
                  </Typography>
                  <Button size="small" onClick={() => navigate('/universities')}>
                    Browse All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {recommendations?.data?.slice(0, 3).map((uni) => (
                    <Grid item xs={12} sm={4} key={uni._id}>
                      <Card variant="outlined" sx={{ cursor: 'pointer' }}>
                        <CardContent>
                          <Avatar src={uni.logo} sx={{ width: 60, height: 60, mb: 2 }} />
                          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            {uni.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {uni.city}, {uni.country}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Upcoming Deadlines */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Upcoming Deadlines
                </Typography>
                <List>
                  {upcomingDeadlines?.data?.slice(0, 5).map((app) => (
                    <ListItem
                      key={app._id}
                      sx={{
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        mb: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/dashboard/applications/${app._id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <DeadlineIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={app.universityId?.name}
                        secondary={`${daysUntil(app.deadline)} days left`}
                      />
                    </ListItem>
                  ))}
                </List>
                {!upcomingDeadlines?.data?.length && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No upcoming deadlines
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Quick Actions
                </Typography>
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<FinderIcon />}
                    onClick={() => navigate('/university-finder')}
                  >
                    Find My University
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/dashboard/applications/new')}
                  >
                    Start New Application
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/universities')}
                  >
                    Browse Universities
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ForumIcon />}
                    onClick={() => navigate('/discussions')}
                  >
                    Discussion Hub
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/scholarships')}
                  >
                    Find Scholarships
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;