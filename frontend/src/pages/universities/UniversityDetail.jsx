import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  Rating,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Share as ShareIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  TrendingUp as RankingIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import universityService from '@/services/universityService';
import useAuthStore from '@/store/authStore';
import LoadingScreen from '@/components/common/LoadingScreen';
import SafeImage from '@/components/common/SafeImage';
import useSafeImage from '@/hooks/useSafeImage';
import { formatCurrency, formatDate } from '@/utils/formatters';

const UniversityDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [currentTab, setCurrentTab] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const { data: university, isLoading } = useQuery(
    ['university', slug],
    () => universityService.getBySlug(slug),
    {
      onSuccess: (data) => {
        // Track view
        universityService.incrementView(data.data._id);
      },
    }
  );

  const uni = university?.data;
  const coverImageSrc = useSafeImage(uni?.coverImage, uni?._id);

  const handleSaveToggle = () => {
    if (!isAuthenticated) {
      toast.info('Please login to save universities');
      navigate('/login');
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Saved successfully');
  };

  const handleApply = () => {
    const url = uni.applicationLink || uni.website;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('Application link not available for this university');
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!uni) return <Typography>University not found</Typography>;

  return (
    <>
      <Helmet>
        <title>{uni.name} - StudyBridge</title>
        <meta name="description" content={uni.overview?.description} />
      </Helmet>

      <Box>
        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            height: 400,
            backgroundImage: `url(${coverImageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
            },
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', pt: 4 }}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 32,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 3,
              }}
            >
              <Avatar
                src={uni.logo}
                alt={uni.name}
                sx={{ width: 120, height: 120, bgcolor: 'white', p: 1 }}
                imgProps={{
                  onError: (e) => { e.target.style.display = 'none'; },
                }}
              >
                <SchoolIcon sx={{ fontSize: 64, color: 'grey.400' }} />
              </Avatar>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  {uni.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <LocationIcon />
                  <Typography variant="h6">
                    {uni.city}, {uni.country}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating value={uni.averageRating} readOnly />
                  <Typography>({uni.reviewCount || 0} reviews)</Typography>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Action Bar */}
        <Paper sx={{ borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2 }}>
              <Stack direction="row" spacing={1}>
                {uni.rankings?.qsRanking?.world && (
                  <Chip
                    icon={<RankingIcon />}
                    label={`QS World Ranking #${uni.rankings.qsRanking.world}`}
                    color="primary"
                  />
                )}
                <Chip label={uni.universityType} variant="outlined" />
                {uni.isVerified && <Chip label="Verified" color="success" />}
              </Stack>
              <Stack direction="row" spacing={1}>
                <IconButton onClick={handleSaveToggle} color={isSaved ? 'primary' : 'default'}>
                  {isSaved ? <BookmarkedIcon /> : <BookmarkIcon />}
                </IconButton>
                <IconButton>
                  <ShareIcon />
                </IconButton>
                <Button variant="contained" onClick={handleApply}>
                  Apply Now
                </Button>
              </Stack>
            </Box>
          </Container>
        </Paper>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
                  <Tab label="Overview" />
                  <Tab label="Programs" />
                  <Tab label="Admissions" />
                  <Tab label="Campus Life" />
                  <Tab label="Reviews" />
                </Tabs>
              </Box>

              {/* Overview Tab */}
              {currentTab === 0 && (
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    About {uni.name}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {uni.overview?.description}
                  </Typography>

                  {uni.overview?.mission && (
                    <>
                      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
                        Mission
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {uni.overview.mission}
                      </Typography>
                    </>
                  )}

                  {/* Quick Facts */}
                  <Card sx={{ mt: 4 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Quick Facts
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Established
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {uni.establishedYear}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Students
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {uni.stats?.totalStudents?.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            International Students
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {uni.stats?.internationalStudents?.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Acceptance Rate
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {uni.stats?.acceptanceRate}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Rankings */}
                  {uni.rankings && (
                    <Card sx={{ mt: 3 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          Rankings
                        </Typography>
                        <Table>
                          <TableBody>
                            {uni.rankings.qsRanking?.world && (
                              <TableRow>
                                <TableCell>QS World Ranking</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  #{uni.rankings.qsRanking.world}
                                </TableCell>
                              </TableRow>
                            )}
                            {uni.rankings.timesRanking?.world && (
                              <TableRow>
                                <TableCell>Times Higher Education</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                  #{uni.rankings.timesRanking.world}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              )}

              {/* Programs Tab */}
              {currentTab === 1 && (
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Academic Programs
                  </Typography>
                  {uni.programs?.map((program, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                              {program.name}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              <Chip label={program.level} size="small" color="primary" />
                              <Chip label={program.duration} size="small" variant="outlined" />
                            </Stack>
                            {program.tuitionFee && (
                              <Typography variant="body1" fontWeight={600} color="primary.main">
                                {formatCurrency(
                                  program.tuitionFee.amount,
                                  program.tuitionFee.currency
                                )}
                                /{program.tuitionFee.period}
                              </Typography>
                            )}
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleApply}
                          >
                            Apply
                          </Button>
                        </Box>
                        {program.specializations?.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Specializations:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {program.specializations.map((spec, i) => (
                                <Chip key={i} label={spec} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {/* Admissions Tab */}
              {currentTab === 2 && (
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Admissions Information
                  </Typography>

                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Application Fee
                      </Typography>
                      <Typography variant="h4" color="primary.main" fontWeight={700}>
                        {formatCurrency(
                          uni.admissions?.applicationFee?.amount,
                          uni.admissions?.applicationFee?.currency
                        )}
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Required Documents
                      </Typography>
                      <List>
                        {uni.admissions?.requiredDocuments?.map((doc, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={`• ${doc}`} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Application Deadlines
                      </Typography>
                      <Grid container spacing={2}>
                        {uni.admissions?.deadlines?.fall && (
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">
                              Fall Intake
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatDate(uni.admissions.deadlines.fall)}
                            </Typography>
                          </Grid>
                        )}
                        {uni.admissions?.deadlines?.spring && (
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">
                              Spring Intake
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatDate(uni.admissions.deadlines.spring)}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Campus Life Tab */}
              {currentTab === 3 && (
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Campus Life
                  </Typography>

                  {/* Images Gallery */}
                  {uni.images?.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Swiper
                        modules={[Navigation, Pagination]}
                        navigation
                        pagination={{ clickable: true }}
                        spaceBetween={10}
                        slidesPerView={1}
                      >
                        {uni.images.map((image, index) => (
                          <SwiperSlide key={index}>
                            <Box
                              component="img"
                              src={image}
                              alt={`Campus ${index + 1}`}
                              sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 2 }}
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </Box>
                  )}

                  {/* Facilities */}
                  {uni.campusLife?.facilities && (
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          Campus Facilities
                        </Typography>
                        <Grid container spacing={2}>
                          {uni.campusLife.facilities.map((facility, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SchoolIcon color="primary" />
                                <Typography>{facility.name}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  {/* Accommodation */}
                  {uni.campusLife?.accommodation && (
                    <Card>
                      <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          Accommodation
                        </Typography>
                        <Typography variant="body1" paragraph>
                          Available: {uni.campusLife.accommodation.available ? 'Yes' : 'No'}
                        </Typography>
                        {uni.campusLife.accommodation.cost && (
                          <Typography variant="body1">
                            Cost: {formatCurrency(uni.campusLife.accommodation.cost.min)} -{' '}
                            {formatCurrency(uni.campusLife.accommodation.cost.max)}/month
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Box>
              )}

              {/* Reviews Tab */}
              {currentTab === 4 && (
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Student Reviews
                  </Typography>
                  {uni.reviews?.length > 0 ? (
                    uni.reviews.map((review, index) => (
                      <Card key={index} sx={{ mb: 2 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Avatar>{review.userId?.firstName?.[0]}</Avatar>
                            <Box>
                              <Typography fontWeight={700}>
                                {review.userId?.firstName} {review.userId?.lastName}
                              </Typography>
                              <Rating value={review.ratings.overall} readOnly size="small" />
                            </Box>
                          </Box>
                          <Typography variant="h6" gutterBottom>
                            {review.title}
                          </Typography>
                          <Typography variant="body2">{review.review}</Typography>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography color="text.secondary">No reviews yet</Typography>
                  )}
                </Box>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Quick Apply */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Ready to Apply?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Start your application to {uni.name}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleApply}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Contact Information
                  </Typography>
                  <Stack spacing={2}>
                    {uni.website && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Website
                        </Typography>
                        <Typography
                          variant="body2"
                          component="a"
                          href={uni.website}
                          target="_blank"
                          sx={{ color: 'primary.main' }}
                        >
                          {uni.website}
                        </Typography>
                      </Box>
                    )}
                    {uni.contactInfo?.email && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body2">{uni.contactInfo.email}</Typography>
                      </Box>
                    )}
                    {uni.contactInfo?.phone && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body2">{uni.contactInfo.phone}</Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Scholarships */}
              {uni.scholarships?.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Available Scholarships
                    </Typography>
                    {uni.scholarships.slice(0, 3).map((scholarship, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {scholarship.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(scholarship.amount, scholarship.currency)}
                        </Typography>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/scholarships')}
                    >
                      View All Scholarships
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default UniversityDetail;