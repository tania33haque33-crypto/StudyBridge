import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Drawer,
  IconButton,
  Pagination,
  Skeleton,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Event as DeadlineIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import SearchBar from '@/components/common/SearchBar';
import scholarshipService from '@/services/scholarshipService';
import useAuthStore from '@/store/authStore';
import useDebounce from '@/hooks/useDebounce';
import usePagination from '@/hooks/usePagination';
import { formatCurrency, formatDate, daysUntil } from '@/utils/formatters';

const ScholarshipSearch = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [savedScholarships, setSavedScholarships] = useState([]);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const { page, limit, handlePageChange } = usePagination();

  const { data, isLoading } = useQuery(
    ['scholarships', debouncedSearch, filters, page, limit],
    () =>
      scholarshipService.search({
        q: debouncedSearch,
        ...filters,
        page,
        limit,
      }),
    { keepPreviousData: true }
  );

  const handleSaveToggle = async (scholarshipId) => {
    if (!isAuthenticated) {
      toast.info('Please login to save scholarships');
      navigate('/login');
      return;
    }

    try {
      const isSaved = savedScholarships.includes(scholarshipId);
      if (isSaved) {
        await scholarshipService.unsave(scholarshipId);
        setSavedScholarships(savedScholarships.filter((id) => id !== scholarshipId));
        toast.success('Scholarship removed from saved list');
      } else {
        await scholarshipService.save(scholarshipId);
        setSavedScholarships([...savedScholarships, scholarshipId]);
        toast.success('Scholarship saved successfully');
      }
    } catch (error) {
      toast.error('Failed to update saved scholarships');
    }
  };

  return (
    <>
      <Helmet>
        <title>Search Scholarships - StudyBridge</title>
        <meta name="description" content="Find scholarships for international students" />
      </Helmet>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Find Scholarships
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover {data?.total || 5000}+ scholarship opportunities
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <SearchBar
              placeholder="Search scholarships by name, country, or field..."
              onSearch={setSearchQuery}
              onFilterClick={() => setFilterDrawerOpen(true)}
            />
          </Box>

          {isLoading ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card>
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
                {data.data.map((scholarship) => (
                  <Grid item xs={12} md={6} lg={4} key={scholarship._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                            {scholarship.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleSaveToggle(scholarship._id)}
                          >
                            {savedScholarships.includes(scholarship._id) ? (
                              <BookmarkedIcon color="primary" />
                            ) : (
                              <BookmarkIcon />
                            )}
                          </IconButton>
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          <Chip label={scholarship.type} size="small" color="primary" />
                          <Chip label={scholarship.country} size="small" variant="outlined" />
                        </Stack>

                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="h4"
                            fontWeight={800}
                            color="primary.main"
                            gutterBottom
                          >
                            {formatCurrency(
                              scholarship.amount.value,
                              scholarship.amount.currency
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {scholarship.amount.type}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2,
                          }}
                        >
                          {scholarship.description}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            bgcolor: daysUntil(scholarship.deadline) < 30 ? 'error.lighter' : 'background.default',
                            borderRadius: 2,
                          }}
                        >
                          <DeadlineIcon
                            fontSize="small"
                            color={daysUntil(scholarship.deadline) < 30 ? 'error' : 'action'}
                          />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Deadline
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatDate(scholarship.deadline)} ({daysUntil(scholarship.deadline)}{' '}
                              days left)
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => navigate(`/scholarships/${scholarship._id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>

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
                No scholarships found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          )}
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
          {/* Add filter components here */}
        </Box>
      </Drawer>
    </>
  );
};

export default ScholarshipSearch;