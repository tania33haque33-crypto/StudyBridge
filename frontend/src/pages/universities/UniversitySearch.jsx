import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '@/services/userService';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Drawer,
  IconButton,
  Stack,
  Pagination,
  Rating,
  Skeleton,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import SearchBar from '@/components/common/SearchBar';
import UniversityFilters from '@/components/Universities/UniversityFilters';
import SafeImage from '@/components/common/SafeImage';
import universityService from '@/services/universityService';
import useAuthStore from '@/store/authStore';
import useDebounce from '@/hooks/useDebounce';
import usePagination from '@/hooks/usePagination';
import { formatCurrency } from '@/utils/formatters';

const UniversitySearch = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [savedUniversities, setSavedUniversities] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    userService.getSavedUniversities()
      .then((res) => setSavedUniversities((res.data || []).map((u) => u._id)))
      .catch(() => {});
  }, [isAuthenticated]);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const { page, limit, handlePageChange } = usePagination();

  // Fetch universities
  const { data, isLoading, refetch } = useQuery(
    ['universities', debouncedSearch, filters, page, limit],
    () =>
      universityService.search({
        q: debouncedSearch,
        ...filters,
        page,
        limit,
      }),
    {
      keepPreviousData: true,
    }
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    handlePageChange(null, 1);
  };

  const handleSaveToggle = async (universityId) => {
    if (!isAuthenticated) {
      toast.info('Please login to save universities');
      navigate('/login');
      return;
    }

    try {
      const isSaved = savedUniversities.includes(universityId);
      if (isSaved) {
        await userService.unsaveUniversity(universityId);
        setSavedUniversities(savedUniversities.filter((id) => id !== universityId));
        toast.success('University removed from saved list');
      } else {
        await userService.saveUniversity(universityId);
        setSavedUniversities([...savedUniversities, universityId]);
        toast.success('University saved successfully');
      }
    } catch (error) {
      toast.error('Failed to update saved universities');
    }
  };

  return (
    <>
      <Helmet>
        <title>Search Universities - StudyBridge</title>
        <meta name="description" content="Search and discover universities worldwide" />
      </Helmet>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Discover Universities
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Explore {data?.total || 10000}+ universities worldwide
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <SearchBar
              placeholder="Search universities by name, location, or course..."
              onSearch={handleSearch}
              onFilterClick={() => setFilterDrawerOpen(true)}
            />
          </Box>

          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(filters).map(([key, value]) =>
                value ? (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    onDelete={() => {
                      const newFilters = { ...filters };
                      delete newFilters[key];
                      setFilters(newFilters);
                    }}
                    color="primary"
                    variant="outlined"
                  />
                ) : null
              )}
              <Button
                size="small"
                onClick={() => setFilters({})}
                sx={{ ml: 1 }}
              >
                Clear All
              </Button>
            </Box>
          )}

          <Grid container spacing={3}>
            {/* Results */}
            <Grid item xs={12}>
              {isLoading ? (
                <Grid container spacing={3}>
                  {[...Array(6)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <Skeleton variant="rectangular" height={200} />
                        <CardContent>
                          <Skeleton variant="text" height={30} />
                          <Skeleton variant="text" />
                          <Skeleton variant="text" width="60%" />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : data?.data?.length > 0 ? (
                <>
                  <Grid container spacing={3}>
                    {data.data.map((university) => (
                      <Grid item xs={12} sm={6} md={4} key={university._id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                            },
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <SafeImage
                              src={university.coverImage}
                              alt={university.name}
                              seed={university._id}
                              sx={{
                                width: '100%',
                                height: 200,
                                cursor: 'pointer',
                              }}
                              onClick={() => navigate(`/universities/${university.slug}`)}
                            />
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'rgba(255,255,255,0.9)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                              }}
                              onClick={() => handleSaveToggle(university._id)}
                            >
                              {savedUniversities.includes(university._id) ? (
                                <BookmarkedIcon color="primary" />
                              ) : (
                                <BookmarkIcon />
                              )}
                            </IconButton>
                          </Box>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              gutterBottom
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { color: 'primary.main' },
                              }}
                              onClick={() => navigate(`/universities/${university.slug}`)}
                            >
                              {university.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {university.city}, {university.country}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Rating value={university.averageRating} readOnly size="small" />
                              <Typography variant="body2" color="text.secondary">
                                ({university.reviewCount || 0})
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              {university.rankings?.qsRanking?.world && (
                                <Chip
                                  label={`QS #${university.rankings.qsRanking.world}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                              <Chip
                                label={university.universityType}
                                size="small"
                                variant="outlined"
                              />
                            </Stack>
                            {university.tuitionFees?.undergraduate?.international?.amount && (
                              <Typography variant="body2" color="text.secondary">
                                From{' '}
                                <Typography component="span" fontWeight={700} color="text.primary">
                                  {formatCurrency(
                                    university.tuitionFees.undergraduate.international.amount,
                                    university.tuitionFees.undergraduate.international.currency
                                  )}
                                </Typography>
                                /year
                              </Typography>
                            )}
                          </CardContent>
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => navigate(`/universities/${university.slug}`)}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Pagination */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={data.pages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h5" gutterBottom>
                    No universities found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Try adjusting your search or filters
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 350, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Filters
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <UniversityFilters
            filters={filters}
            onChange={handleFilterChange}
            onClose={() => setFilterDrawerOpen(false)}
          />
        </Box>
      </Drawer>
    </>
  );
};

export default UniversitySearch;