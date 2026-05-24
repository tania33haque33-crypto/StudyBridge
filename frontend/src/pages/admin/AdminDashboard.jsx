import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Description as ApplicationIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import adminService from '@/services/adminService';

const COLORS = ['#667eea', '#10b981', '#ef4444', '#f59e0b', '#764ba2'];

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={80} height={48} />
          ) : (
            <Typography variant="h4" fontWeight={800}>
              {value ?? '—'}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main` }}>{icon}</Avatar>
      </Stack>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'adminDashboardStats',
    adminService.getDashboardStats,
    { refetchOnWindowFocus: false }
  );

  const { data: appStatsData, isLoading: appLoading } = useQuery(
    'adminAppStats',
    adminService.getApplicationStats,
    { refetchOnWindowFocus: false }
  );

  const stats = statsData?.data || {};
  const appStats = appStatsData?.data || {};

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers?.toLocaleString(), icon: <PeopleIcon />, color: 'primary' },
    { title: 'Universities', value: stats.totalUniversities?.toLocaleString(), icon: <SchoolIcon />, color: 'success' },
    { title: 'Applications', value: stats.totalApplications?.toLocaleString(), icon: <ApplicationIcon />, color: 'info' },
    { title: 'Active Sessions', value: stats.activeUsers?.toLocaleString(), icon: <TrendingIcon />, color: 'warning' },
  ];

  const userGrowthData = stats.userGrowth || [
    { month: 'Jan', users: 0 }, { month: 'Feb', users: 0 }, { month: 'Mar', users: 0 },
    { month: 'Apr', users: 0 }, { month: 'May', users: 0 }, { month: 'Jun', users: 0 },
  ];

  const applicationStatusData = appStats.byStatus
    ? Object.entries(appStats.byStatus).map(([name, value], i) => ({
        name,
        value,
        color: COLORS[i % COLORS.length],
      }))
    : [
        { name: 'Submitted', value: 0, color: COLORS[0] },
        { name: 'Under Review', value: 0, color: COLORS[1] },
        { name: 'Accepted', value: 0, color: COLORS[2] },
        { name: 'Rejected', value: 0, color: COLORS[3] },
      ];

  const recentActivities = stats.recentActivities || [];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - StudyBridge</title>
      </Helmet>

      <Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome to the admin panel
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...stat} loading={statsLoading} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* User Growth Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  User Growth
                </Typography>
                {statsLoading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#667eea" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Recent Activities
                </Typography>
                {statsLoading ? (
                  [1, 2, 3].map((i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                      </Box>
                    </Box>
                  ))
                ) : recentActivities.length > 0 ? (
                  <List disablePadding>
                    {recentActivities.map((activity, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 1 }}>
                        <ListItemAvatar>
                          <Avatar>{activity.user?.[0] || '?'}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.action}
                          secondary={`${activity.user} • ${activity.time}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No recent activities
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Application Status Pie */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Application Status
                </Typography>
                {appLoading ? (
                  <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(e) => e.name}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {applicationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Quick Stats
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Pending Reviews</Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {statsLoading ? '—' : (stats.pendingReviews ?? 0)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant={statsLoading ? 'indeterminate' : 'determinate'}
                      value={statsLoading ? undefined : Math.min((stats.pendingReviews / 200) * 100, 100)}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Verified Universities</Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {statsLoading ? '—' : (stats.verifiedUniversities ?? 0)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant={statsLoading ? 'indeterminate' : 'determinate'}
                      value={
                        statsLoading
                          ? undefined
                          : stats.totalUniversities
                          ? Math.round((stats.verifiedUniversities / stats.totalUniversities) * 100)
                          : 0
                      }
                      color="success"
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Email Verified Users</Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {statsLoading ? '—' : (stats.verifiedUsers ?? 0)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant={statsLoading ? 'indeterminate' : 'determinate'}
                      value={
                        statsLoading
                          ? undefined
                          : stats.totalUsers
                          ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100)
                          : 0
                      }
                      color="info"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AdminDashboard;
