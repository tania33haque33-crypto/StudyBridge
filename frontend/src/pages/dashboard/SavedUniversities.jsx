import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Rating,
  Chip,
  Button,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  BookmarkRemove as RemoveIcon,
  LocationOn as LocationIcon,
  TrendingUp as RankingIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import userService from '@/services/userService';
import SafeImage from '@/components/common/SafeImage';
import { formatCurrency } from '@/utils/formatters';

const SavedUniversities = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('savedUniversities', userService.getSavedUniversities);

  const removeMutation = useMutation(userService.unsaveUniversity, {
    onSuccess: () => {
      queryClient.invalidateQueries('savedUniversities');
      toast.success('University removed from saved list');
    },
    onError: () => toast.error('Failed to remove university'),
  });

  const savedUniversities = data?.data || [];

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>
          Saved Universities
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
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
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Saved Universities - StudyBridge</title>
      </Helmet>

      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Saved Universities
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {savedUniversities.length} universit{savedUniversities.length === 1 ? 'y' : 'ies'} bookmarked
          </Typography>
        </Box>

        {savedUniversities.length > 0 ? (
          <Grid container spacing={3}>
            {savedUniversities.map((uni) => (
              <Grid item xs={12} sm={6} md={4} key={uni._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                  }}
                >
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      zIndex: 1,
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                    }}
                    onClick={() => removeMutation.mutate(uni._id)}
                    disabled={removeMutation.isLoading}
                  >
                    <RemoveIcon color="error" />
                  </IconButton>

                  <SafeImage
                    src={uni.coverImage}
                    alt={uni.name}
                    seed={uni._id}
                    sx={{ width: '100%', height: 200, cursor: 'pointer' }}
                    onClick={() => navigate(`/universities/${uni.slug}`)}
                  />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      onClick={() => navigate(`/universities/${uni.slug}`)}
                    >
                      {uni.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {uni.city}, {uni.country}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Rating value={uni.averageRating || 0} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({uni.reviewCount || 0})
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                      {uni.rankings?.qsRanking?.world && (
                        <Chip
                          icon={<RankingIcon />}
                          label={`QS #${uni.rankings.qsRanking.world}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      <Chip label={uni.universityType} size="small" variant="outlined" />
                    </Stack>
                    {uni.tuitionFees?.undergraduate?.international?.amount > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        From{' '}
                        <Typography component="span" fontWeight={700} color="text.primary">
                          {formatCurrency(
                            uni.tuitionFees.undergraduate.international.amount,
                            uni.tuitionFees.undergraduate.international.currency
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
                      onClick={() => navigate(`/universities/${uni.slug}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No saved universities yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Start exploring universities and save your favorites
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/universities')}
              >
                Browse Universities
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
};

export default SavedUniversities;
