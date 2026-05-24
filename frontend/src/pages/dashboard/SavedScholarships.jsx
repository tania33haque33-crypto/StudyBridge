import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import {
  BookmarkRemove as RemoveIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import scholarshipService from '@/services/scholarshipService';
import { formatCurrency, formatDate, daysUntil } from '@/utils/formatters';

const SavedScholarships = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: scholarships, isLoading } = useQuery('savedScholarships', scholarshipService.getSaved);

  const unsaveMutation = useMutation(scholarshipService.unsave, {
    onSuccess: () => {
      queryClient.invalidateQueries('savedScholarships');
      toast.success('Scholarship removed from saved list');
    },
  });

  const handleRemove = (id) => {
    unsaveMutation.mutate(id);
  };

  return (
    <>
      <Helmet>
        <title>Saved Scholarships - StudyBridge</title>
      </Helmet>

      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Saved Scholarships
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Scholarships you've bookmarked for later
          </Typography>
        </Box>

        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : scholarships?.data?.length > 0 ? (
          <Grid container spacing={3}>
            {scholarships.data.map((scholarship) => (
              <Grid item xs={12} md={6} lg={4} key={scholarship._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
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
                    onClick={() => handleRemove(scholarship._id)}
                  >
                    <RemoveIcon color="error" />
                  </IconButton>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' },
                      }}
                      onClick={() => navigate(`/scholarships/${scholarship._id}`)}
                    >
                      {scholarship.name}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip label={scholarship.type} size="small" color="primary" />
                      <Chip label={scholarship.country} size="small" variant="outlined" />
                    </Stack>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          {formatCurrency(scholarship.amount.value, scholarship.amount.currency)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {scholarship.amount.type}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.5,
                        bgcolor:
                          daysUntil(scholarship.deadline) < 30
                            ? 'error.lighter'
                            : 'background.default',
                        borderRadius: 2,
                      }}
                    >
                      <EventIcon
                        fontSize="small"
                        color={daysUntil(scholarship.deadline) < 30 ? 'error' : 'action'}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Deadline
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatDate(scholarship.deadline)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            daysUntil(scholarship.deadline) < 30 ? 'error.main' : 'text.secondary'
                          }
                        >
                          {daysUntil(scholarship.deadline)} days left
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
        ) : (
          <Card>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                No saved scholarships yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Start exploring scholarships and save your favorites
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/scholarships')}
              >
                Browse Scholarships
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
};

export default SavedScholarships;