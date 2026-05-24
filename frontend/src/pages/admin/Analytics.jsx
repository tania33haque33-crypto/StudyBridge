import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Stack,
  Avatar,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Description as AppIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Helmet } from 'react-helmet-async';
import adminService from '@/services/adminService';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30days');

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

  const { data: uniStatsData, isLoading: uniLoading } = useQuery(
    'adminUniStats',
    adminService.getUniversityStats,
    { refetchOnWindowFocus: false }
  );

  const stats = statsData?.data || {};
  const appStats = appStatsData?.data || {};
  const uniStats = uniStatsData?.data || {};

  const userGrowthData = stats.userGrowth || [
    { date: 'Jan', users: 0, applications: 0 },
    { date: 'Feb', users: 0, applications: 0 },
    { date: 'Mar', users: 0, applications: 0 },
    { date: 'Apr', users: 0, applications: 0 },
    { date: 'May', users: 0, applications: 0 },
    { date: 'Jun', users: 0, applications: 0 },
  ];

  const countryDistribution = uniStats.byCountry
    ? Object.entries(uniStats.byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value], i) => ({ name, value, color: COLORS[i] }))
    : [];

  const popularUniversities = uniStats.mostViewed
    ? uniStats.mostViewed.slice(0, 5).map((u) => ({ name: u.name?.substring(0, 15), applications: u.viewCount || 0 }))
    : [];

  const applicationStatusData = appStats.byStatus
    ? Object.entries(appStats.byStatus).map(([month, data]) => ({ month, ...data }))
    : [];

  const summaryCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <PeopleIcon />, color: '#667eea' },
    { label: 'Universities', value: stats.totalUniversities, icon: <SchoolIcon />, color: '#10b981' },
    { label: 'Applications', value: stats.totalApplications, icon: <AppIcon />, color: '#764ba2' },
    { label: 'Active Users', value: stats.activeUsers, icon: <TrendingIcon />, color: '#f59e0b' },
  ];

  return (
    <>
      <Helmet>
        <title>Analytics - Admin</title>
      </Helmet>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
          <Typography variant="h4" fontWeight={800}>
            Analytics & Insights
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} label="Time Range" onChange={(e) => setTimeRange(e.target.value)}>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Summary Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summaryCards.map((card, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                      {statsLoading ? (
                        <Skeleton variant="text" width={80} height={40} />
                      ) : (
                        <Typography variant="h4" fontWeight={800}>
                          {card.value?.toLocaleString() ?? '—'}
                        </Typography>
                      )}
                    </Box>
                    <Avatar sx={{ bgcolor: card.color }}>{card.icon}</Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* User Growth & Applications Area Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  User Growth & Applications
                </Typography>
                {statsLoading ? (
                  <Skeleton variant="rectangular" height={350} />
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#764ba2" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#764ba2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="users" stroke="#667eea" fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="applications" stroke="#764ba2" fillOpacity={1} fill="url(#colorApps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Universities by Country Pie */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Universities by Country
                </Typography>
                {uniLoading ? (
                  <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                ) : countryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={countryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(e) => `${e.name} (${e.value})`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {countryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Application Status Trends */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Application Status Trends
                </Typography>
                {appLoading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : applicationStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={applicationStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="submitted" stroke="#667eea" strokeWidth={2} />
                      <Line type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No application trend data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Most Viewed Universities */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Most Viewed Universities
                </Typography>
                {uniLoading ? (
                  <Skeleton variant="rectangular" height={300} />
                ) : popularUniversities.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={popularUniversities} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="applications" fill="#667eea" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Analytics;
