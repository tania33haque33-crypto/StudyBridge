import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button, Chip,
  TextField, InputAdornment, Avatar, Stack, Tab, Tabs, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, Pagination, Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Forum as ForumIcon,
  Visibility as ViewIcon,
  ChatBubbleOutline as ReplyIcon,
  ThumbUpOutlined as LikeIcon,
  PushPin as PinIcon,
  Lock as LockIcon,
  PublicOutlined as GlobeIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '@/store/authStore';
import discussionService from '@/services/discussionService';

const STUDY_COUNTRIES = [
  'All Countries', 'USA', 'UK', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Singapore', 'Japan', 'South Korea',
  'New Zealand', 'Ireland', 'Sweden', 'Switzerland', 'Italy',
  'Spain', 'China', 'Malaysia', 'UAE',
];

const CATEGORIES = [
  'General', 'Visa & Immigration', 'Accommodation', 'Scholarships',
  'University Life', 'Language & Culture', 'Jobs & Career', 'Cost of Living', 'Pre-Departure',
];

const CATEGORY_COLORS = {
  'General': 'default',
  'Visa & Immigration': 'warning',
  'Accommodation': 'info',
  'Scholarships': 'success',
  'University Life': 'primary',
  'Language & Culture': 'secondary',
  'Jobs & Career': 'error',
  'Cost of Living': 'warning',
  'Pre-Departure': 'info',
};

const DiscussionCard = ({ discussion, onClick }) => (
  <Card
    sx={{
      mb: 2,
      cursor: 'pointer',
      transition: 'all 0.2s',
      borderLeft: discussion.isPinned ? '4px solid' : '4px solid transparent',
      borderLeftColor: discussion.isPinned ? 'primary.main' : 'transparent',
      '&:hover': { transform: 'translateX(4px)', boxShadow: 3 },
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar
          src={discussion.author?.profilePicture}
          sx={{ width: 44, height: 44, flexShrink: 0, mt: 0.5 }}
        >
          {discussion.author?.firstName?.[0]}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            {discussion.isPinned && <PinIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
            {discussion.isLocked && <LockIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
              {discussion.title}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap">
            <Chip
              label={discussion.category}
              size="small"
              color={CATEGORY_COLORS[discussion.category] || 'default'}
              variant="outlined"
            />
            <Chip
              icon={<GlobeIcon sx={{ fontSize: '14px !important' }} />}
              label={discussion.country}
              size="small"
              variant="outlined"
            />
            {discussion.tags?.slice(0, 2).map((tag) => (
              <Chip key={tag} label={`#${tag}`} size="small" sx={{ fontSize: 11 }} />
            ))}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {discussion.content}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              by <strong>{discussion.author?.firstName} {discussion.author?.lastName}</strong>
              {' · '}{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <ViewIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">{discussion.views}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <ReplyIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">{discussion.replyCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <LikeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary">{discussion.likes?.length || 0}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DiscussionHub = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { title: '', content: '', country: '', category: 'General', tags: '' },
  });

  const { data, isLoading } = useQuery(
    ['discussions', selectedCountry, selectedCategory, searchQuery, sort, page],
    () =>
      discussionService.getAll({
        country: selectedCountry !== 'All Countries' ? selectedCountry : undefined,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        sort,
        page,
        limit: 12,
      }),
    { keepPreviousData: true }
  );

  const { data: countryStatsData } = useQuery('discussionCountryStats', discussionService.getCountryStats);
  const countryStats = countryStatsData?.data || [];

  const createMutation = useMutation(discussionService.create, {
    onSuccess: (res) => {
      queryClient.invalidateQueries('discussions');
      queryClient.invalidateQueries('discussionCountryStats');
      toast.success('Discussion posted!');
      setCreateOpen(false);
      reset();
      navigate(`/discussions/${res.data._id}`);
    },
    onError: () => toast.error('Failed to create discussion'),
  });

  const onSubmit = (data) => {
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    createMutation.mutate({ ...data, tags });
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) { toast.info('Please login to post a discussion'); navigate('/login'); return; }
    setCreateOpen(true);
  };

  const discussions = data?.data || [];
  const totalPages = data?.pages || 1;

  return (
    <>
      <Helmet>
        <title>Discussion Hub - StudyBridge</title>
        <meta name="description" content="Connect with students worldwide. Share experiences, ask questions and get answers about studying abroad." />
      </Helmet>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Hero */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 6,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <ForumIcon sx={{ fontSize: 36 }} />
                  <Typography variant="h3" fontWeight={800}>Discussion Hub</Typography>
                </Box>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Connect with students worldwide · Share experiences · Get answers
                </Typography>
                <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={800}>{data?.total || 0}+</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Discussions</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={800}>{countryStats.length}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Countries</Typography>
                  </Box>
                </Stack>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleCreateClick}
                sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700, '&:hover': { bgcolor: 'grey.100' } }}
              >
                Start a Discussion
              </Button>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {/* Sidebar */}
            <Grid item xs={12} md={3}>
              {/* Country Filter */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Study Destinations
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {STUDY_COUNTRIES.map((c) => {
                      const stat = countryStats.find((s) => s._id === c);
                      const active = selectedCountry === c;
                      return (
                        <Box
                          key={c}
                          onClick={() => { setSelectedCountry(c); setPage(1); }}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: active ? 'primary.main' : 'transparent',
                            color: active ? 'white' : 'text.primary',
                            '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
                          }}
                        >
                          <Typography variant="body2" fontWeight={active ? 700 : 400}>{c}</Typography>
                          {stat && (
                            <Chip
                              label={stat.count}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 10,
                                bgcolor: active ? 'rgba(255,255,255,0.25)' : 'action.selected',
                                color: active ? 'white' : 'text.secondary',
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>

              {/* Category Filter */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Categories
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box
                      onClick={() => { setSelectedCategory(''); setPage(1); }}
                      sx={{
                        px: 1.5, py: 0.75, borderRadius: 1, cursor: 'pointer',
                        bgcolor: !selectedCategory ? 'primary.main' : 'transparent',
                        color: !selectedCategory ? 'white' : 'text.primary',
                        '&:hover': { bgcolor: !selectedCategory ? 'primary.dark' : 'action.hover' },
                      }}
                    >
                      <Typography variant="body2" fontWeight={!selectedCategory ? 700 : 400}>All Categories</Typography>
                    </Box>
                    {CATEGORIES.map((cat) => {
                      const active = selectedCategory === cat;
                      return (
                        <Box
                          key={cat}
                          onClick={() => { setSelectedCategory(cat); setPage(1); }}
                          sx={{
                            px: 1.5, py: 0.75, borderRadius: 1, cursor: 'pointer',
                            bgcolor: active ? 'primary.main' : 'transparent',
                            color: active ? 'white' : 'text.primary',
                            '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
                          }}
                        >
                          <Typography variant="body2" fontWeight={active ? 700 : 400}>{cat}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} md={9}>
              {/* Search + Sort Bar */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  }}
                />
                <FormControl sx={{ minWidth: 160 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select value={sort} label="Sort by" onChange={(e) => setSort(e.target.value)}>
                    <MenuItem value="latest">Latest</MenuItem>
                    <MenuItem value="popular">Most Viewed</MenuItem>
                    <MenuItem value="mostReplied">Most Replied</MenuItem>
                    <MenuItem value="oldest">Oldest</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Active Filters */}
              {(selectedCountry !== 'All Countries' || selectedCategory) && (
                <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                  {selectedCountry !== 'All Countries' && (
                    <Chip label={selectedCountry} onDelete={() => setSelectedCountry('All Countries')} color="primary" />
                  )}
                  {selectedCategory && (
                    <Chip label={selectedCategory} onDelete={() => setSelectedCategory('')} color="secondary" />
                  )}
                </Stack>
              )}

              {/* Discussions List */}
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Skeleton variant="circular" width={44} height={44} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Skeleton variant="text" height={28} width="70%" />
                          <Skeleton variant="text" width="40%" />
                          <Skeleton variant="text" />
                          <Skeleton variant="text" width="60%" />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : discussions.length === 0 ? (
                <Card>
                  <CardContent sx={{ py: 8, textAlign: 'center' }}>
                    <ForumIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>No discussions yet</Typography>
                    <Typography color="text.secondary" paragraph>
                      Be the first to start a discussion{selectedCountry !== 'All Countries' ? ` about studying in ${selectedCountry}` : ''}!
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
                      Start Discussion
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {discussions.map((d) => (
                    <DiscussionCard
                      key={d._id}
                      discussion={d}
                      onClick={() => navigate(`/discussions/${d._id}`)}
                    />
                  ))}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" size="large" />
                    </Box>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Create Discussion Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Start a New Discussion</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Controller
              name="country"
              control={control}
              rules={{ required: 'Country is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.country}>
                  <InputLabel>Study Destination Country *</InputLabel>
                  <Select {...field} label="Study Destination Country *">
                    {STUDY_COUNTRIES.filter((c) => c !== 'All Countries').map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                  {errors.country && <Typography variant="caption" color="error">{errors.country.message}</Typography>}
                </FormControl>
              )}
            />
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select {...field} label="Category">
                    {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required', minLength: { value: 10, message: 'Title must be at least 10 characters' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Discussion Title *"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message || `${field.value?.length || 0}/200`}
                  inputProps={{ maxLength: 200 }}
                />
              )}
            />
            <Controller
              name="content"
              control={control}
              rules={{ required: 'Content is required', minLength: { value: 20, message: 'Content must be at least 20 characters' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Your Question / Discussion *"
                  fullWidth
                  multiline
                  rows={6}
                  error={!!errors.content}
                  helperText={errors.content?.message || `${field.value?.length || 0}/5000`}
                  inputProps={{ maxLength: 5000 }}
                />
              )}
            />
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Tags (comma-separated)"
                  fullWidth
                  placeholder="e.g. visa, student life, housing"
                  helperText="Add up to 5 tags to help others find your discussion"
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setCreateOpen(false); reset(); }}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Posting...' : 'Post Discussion'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default DiscussionHub;
