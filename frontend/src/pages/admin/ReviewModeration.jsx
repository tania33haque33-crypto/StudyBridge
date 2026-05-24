import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import reviewService from '@/services/reviewService';
import { formatDate } from '@/utils/formatters';

const ReviewModeration = () => {
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: reviews, isLoading } = useQuery('pendingReviews', reviewService.getPending);

  const approveMutation = useMutation(reviewService.approve, {
    onSuccess: () => {
      queryClient.invalidateQueries('pendingReviews');
      toast.success('Review approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve review');
    },
  });

  const rejectMutation = useMutation(
    ({ id, reason }) => reviewService.reject(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingReviews');
        setRejectDialogOpen(false);
        setRejectionReason('');
        toast.success('Review rejected');
      },
      onError: () => {
        toast.error('Failed to reject review');
      },
    }
  );

  const handleView = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this review?')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (review) => {
    setSelectedReview(review);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectMutation.mutate({ id: selectedReview._id, reason: rejectionReason });
  };

  return (
    <>
      <Helmet>
        <title>Review Moderation - Admin</title>
      </Helmet>

      <Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Review Moderation
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Review and moderate pending user reviews
        </Typography>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>University</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : reviews?.data?.length > 0 ? (
                  reviews.data.map((review) => (
                    <TableRow key={review._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar>{review.userId?.firstName?.[0]}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {review.userId?.firstName} {review.userId?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {review.userId?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{review.universityId?.name}</TableCell>
                      <TableCell>
                        <Rating value={review.ratings?.overall} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={review.moderationStatus}
                          size="small"
                          color={review.moderationStatus === 'Pending' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{formatDate(review.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => handleView(review)}>
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(review._id)}
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleReject(review)}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary">No pending reviews</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Review Details</DialogTitle>
          <DialogContent>
            {selectedReview && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedReview.title}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Overall Rating
                  </Typography>
                  <Rating value={selectedReview.ratings?.overall} readOnly />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Review
                  </Typography>
                  <Typography variant="body1">{selectedReview.review}</Typography>
                </Box>
                {selectedReview.pros?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Pros
                    </Typography>
                    <ul>
                      {selectedReview.pros.map((pro, index) => (
                        <li key={index}>
                          <Typography variant="body2">{pro}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
                {selectedReview.cons?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Cons
                    </Typography>
                    <ul>
                      {selectedReview.cons.map((con, index) => (
                        <li key={index}>
                          <Typography variant="body2">{con}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reject Review</DialogTitle>
          <DialogContent>
            <TextField
              label="Reason for rejection"
              multiline
              rows={4}
              fullWidth
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRejectConfirm} variant="contained" color="error">
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ReviewModeration;