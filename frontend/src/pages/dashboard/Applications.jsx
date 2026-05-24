import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import applicationService from '@/services/applicationService';
import { formatDate, daysUntil } from '@/utils/formatters';

const statusColors = {
  'Not Started': 'default',
  'In Progress': 'info',
  'Submitted': 'primary',
  'Under Review': 'warning',
  'Accepted': 'success',
  'Rejected': 'error',
  'Waitlisted': 'warning',
  'Deferred': 'secondary',
};

const Applications = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, refetch } = useQuery('applications', () =>
    applicationService.getAll()
  );

  const handleMenuOpen = (event, app) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApp(null);
  };

  const handleView = () => {
    navigate(`/dashboard/applications/${selectedApp._id}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await applicationService.delete(selectedApp._id);
      toast.success('Application deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete application');
    }
    handleMenuClose();
  };

  const getProgressPercentage = (status) => {
    const statusMap = {
      'Not Started': 0,
      'In Progress': 30,
      'Submitted': 60,
      'Under Review': 80,
      'Accepted': 100,
      'Rejected': 100,
      'Waitlisted': 90,
      'Deferred': 70,
    };
    return statusMap[status] || 0;
  };

  const filteredApplications = data?.data?.filter((app) =>
    app.universityId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>My Applications - StudyBridge</title>
      </Helmet>

      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              My Applications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage your university applications
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/applications/new')}
          >
            New Application
          </Button>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2}>
              <TextField
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="outlined" startIcon={<FilterIcon />}>
                Filters
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>University</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Intake</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredApplications?.length > 0 ? (
                  filteredApplications.map((app) => (
                    <TableRow
                      key={app._id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/dashboard/applications/${app._id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {app.universityId?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {app.universityId?.city}, {app.universityId?.country}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{app.programName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${app.intake} ${app.intakeYear}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.status}
                          size="small"
                          color={statusColors[app.status]}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={getProgressPercentage(app.status)}
                            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">
                            {getProgressPercentage(app.status)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(app.deadline)}</Typography>
                        <Typography
                          variant="caption"
                          color={daysUntil(app.deadline) < 7 ? 'error' : 'text.secondary'}
                        >
                          {daysUntil(app.deadline)} days left
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, app)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No applications yet
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/dashboard/applications/new')}
                        sx={{ mt: 2 }}
                      >
                        Create Your First Application
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Action Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleView}>
            <ViewIcon sx={{ mr: 1 }} fontSize="small" />
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
};

export default Applications;