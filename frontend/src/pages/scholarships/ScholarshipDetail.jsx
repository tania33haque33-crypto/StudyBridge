import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Share as ShareIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  School as SchoolIcon,
  Public as PublicIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import scholarshipService from '@/services/scholarshipService';
import useAuthStore from '@/store/authStore';
import LoadingScreen from '@/components/common/LoadingScreen';
import { formatCurrency, formatDate, daysUntil } from '@/utils/formatters';

const ScholarshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery(['scholarship', id], () =>
    scholarshipService.getById(id)
  );

  const saveMutation = useMutation(scholarshipService.save, {
    onSuccess: () => {
      queryClient.invalidateQueries(['scholarship', id]);
      toast.success('Scholarship saved successfully');
    },
  });

  const unsaveMutation = useMutation(scholarshipService.unsave, {
    onSuccess: () => {
      queryClient.invalidateQueries(['scholarship', id]);
      toast.success('Scholarship removed from saved list');
    },
  });

  const handleSaveToggle = () => {
    if (!isAuthenticated) {
      toast.info('Please login to save scholarships');
      navigate('/login');
      return;
    }

    // Check if already saved
    const isSaved = false; // Get from data or state
    if (isSaved) {
      unsaveMutation.mutate(id);
    } else {
      saveMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingScreen />;

  const scholarship = data?.data;

  if (!scholarship) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Scholarship not found</Typography>
      </Container>
    );
  }

  const daysRemaining = daysUntil(scholarship.deadline);

  return (
    <>
      <Helmet>
        <title>{scholarship.name} - StudyBridge</title>
        <meta name="description" content={scholarship.description} />
      </Helmet>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Card sx={{ mb: 3, position: 'relative', overflow: 'visible' }}>
            <Box
              sx={{
                height: 200,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
              }}
            >
              <Container maxWidth="lg" sx={{ position: 'relative', height: '100%' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -40,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontSize: '3rem',
                      fontWeight: 800,
                      boxShadow: 3,
                    }}
                  >
                    <MoneyIcon sx={{ fontSize: '4rem' }} />
                  </Avatar>
                </Box>
              </Container>
            </Box>

            <Box sx={{ pt: 6, px: 3, pb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" fontWeight={800} gutterBottom>
                    {scholarship.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label={scholarship.type} color="primary" />
                    <Chip label={scholarship.country} variant="outlined" />
                    {scholarship.studyLevel?.map((level) => (
                      <Chip key={level} label={level} size="small" variant="outlined" />
                    ))}
                  </Stack>
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Provider: {scholarship.provider}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={() => {
                      navigator.share({
                        title: scholarship.name,
                        url: window.location.href,
                      });
                    }}
                  >
                    Share
                  </Button>
                  <Button
                    variant={false ? 'contained' : 'outlined'}
                    startIcon={false ? <BookmarkedIcon /> : <BookmarkIcon />}
                    onClick={handleSaveToggle}
                  >
                    {false ? 'Saved' : 'Save'}
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Card>

          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              {/* Amount & Deadline Alert */}
              <Card sx={{ mb: 3, bgcolor: daysRemaining < 30 ? 'error.lighter' : 'info.lighter' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MoneyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Scholarship Amount
                          </Typography>
                          <Typography variant="h4" fontWeight={800} color="primary.main">
                            {formatCurrency(scholarship.amount.value, scholarship.amount.currency)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {scholarship.amount.type}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <EventIcon
                          sx={{
                            fontSize: 40,
                            color: daysRemaining < 30 ? 'error.main' : 'primary.main',
                          }}
                        />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Application Deadline
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            {formatDate(scholarship.deadline)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={daysRemaining < 30 ? 'error.main' : 'text.secondary'}
                            fontWeight={600}
                          >
                            {daysRemaining} days remaining
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  {daysRemaining < 30 && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(30 - daysRemaining) * 3.33}
                        color="error"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    About This Scholarship
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {scholarship.description}
                  </Typography>
                </CardContent>
              </Card>

              {/* Coverage Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    What's Covered
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {Object.entries(scholarship.coverage).map(([key, value]) =>
                      value ? (
                        <Grid item xs={12} sm={6} key={key}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckIcon color="success" />
                            <Typography variant="body1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                            </Typography>
                          </Box>
                        </Grid>
                      ) : null
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Eligibility Criteria */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Eligibility Criteria
                  </Typography>
                  <List>
                    {scholarship.eligibilityCriteria?.minimumGPA && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Minimum GPA: ${scholarship.eligibilityCriteria.minimumGPA}`}
                        />
                      </ListItem>
                    )}
                    {scholarship.eligibilityCriteria?.nationality?.length > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <PublicIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Nationality"
                          secondary={
                            scholarship.eligibilityCriteria.nationality.join(', ') || 'All nationalities'
                          }
                        />
                      </ListItem>
                    )}
                    {scholarship.eligibilityCriteria?.ageLimit && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`Age Limit: ${scholarship.eligibilityCriteria.ageLimit.min} - ${scholarship.eligibilityCriteria.ageLimit.max} years`}
                        />
                      </ListItem>
                    )}
                    {scholarship.eligibilityCriteria?.academicRequirements?.map((req, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SchoolIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={req} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Application Process */}
              {scholarship.applicationProcess?.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Application Process
                    </Typography>
                    <List>
                      {scholarship.applicationProcess.map((step, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              {index + 1}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Required Documents */}
              {scholarship.requiredDocuments?.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Required Documents
                    </Typography>
                    <List>
                      {scholarship.requiredDocuments.map((doc, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <DescriptionIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={doc} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Quick Facts */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Quick Facts
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Provider
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {scholarship.provider}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Country
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {scholarship.country}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Study Level
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {scholarship.studyLevel?.map((level) => (
                          <Chip key={level} label={level} size="small" />
                        ))}
                      </Box>
                    </Box>
                    {scholarship.numberOfScholarships && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Number of Awards
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {scholarship.numberOfScholarships}
                        </Typography>
                      </Box>
                    )}
                    {scholarship.isRenewable && (
                      <Box>
                        <Chip label="Renewable Scholarship" color="success" size="small" />
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Application Dates */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Important Dates
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    {scholarship.applicationStartDate && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Application Opens
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatDate(scholarship.applicationStartDate)}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Application Deadline
                      </Typography>
                      <Typography variant="body1" fontWeight={600} color="error.main">
                        {formatDate(scholarship.deadline)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Contact Information
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    {scholarship.website && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Website
                        </Typography>
                        <Typography
                          variant="body2"
                          component="a"
                          href={scholarship.website}
                          target="_blank"
                          sx={{ color: 'primary.main', display: 'block', wordBreak: 'break-all' }}
                        >
                          {scholarship.website}
                        </Typography>
                      </Box>
                    )}
                    {scholarship.contactEmail && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body2">{scholarship.contactEmail}</Typography>
                      </Box>
                    )}
                    {scholarship.contactPhone && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body2">{scholarship.contactPhone}</Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Apply Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                component="a"
                href={scholarship.website}
                target="_blank"
                sx={{ mb: 2 }}
              >
                Apply Now
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ScholarshipDetail;