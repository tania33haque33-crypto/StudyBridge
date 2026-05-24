import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button, Chip,
  Avatar, Stack, Divider, TextField, IconButton, Tooltip, Badge,
  Skeleton, Alert, Menu, MenuItem,
} from '@mui/material';
import {
  ThumbUp as LikeFilledIcon,
  ThumbUpOutlined as LikeIcon,
  Reply as ReplyIcon,
  ArrowBack as BackIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as AcceptedIcon,
  Lock as LockIcon,
  PushPin as PinIcon,
  Forum as ForumIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow, format } from 'date-fns';
import useAuthStore from '@/store/authStore';
import discussionService from '@/services/discussionService';

const CATEGORY_COLORS = {
  'General': 'default', 'Visa & Immigration': 'warning', 'Accommodation': 'info',
  'Scholarships': 'success', 'University Life': 'primary', 'Language & Culture': 'secondary',
  'Jobs & Career': 'error', 'Cost of Living': 'warning', 'Pre-Departure': 'info',
};

// ─── Reply Card ───────────────────────────────────────────────────────────────
const ReplyCard = ({ reply, isAuthor, onLike, onDelete, onAccept, currentUserId, discussionAuthorId }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const liked = reply.likes?.some((id) => id === currentUserId || id?._id === currentUserId);
  const canAccept = currentUserId === discussionAuthorId;
  const canDelete = currentUserId === (reply.author?._id || reply.author);

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: reply.isAccepted ? 'success.50' : 'background.paper',
        border: '1px solid',
        borderColor: reply.isAccepted ? 'success.200' : 'divider',
        mb: 2,
        position: 'relative',
      }}
    >
      {reply.isAccepted && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <AcceptedIcon fontSize="small" color="success" />
          <Typography variant="caption" color="success.main" fontWeight={700}>
            Accepted Answer
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar src={reply.author?.profilePicture} sx={{ width: 40, height: 40, flexShrink: 0 }}>
          {reply.author?.firstName?.[0]}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {reply.author?.firstName} {reply.author?.lastName}
                {reply.author?.role === 'admin' && (
                  <Chip label="Admin" size="small" color="error" sx={{ ml: 1, height: 18, fontSize: 10 }} />
                )}
                {reply.author?.role === 'moderator' && (
                  <Chip label="Mod" size="small" color="warning" sx={{ ml: 1, height: 18, fontSize: 10 }} />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
            {(canDelete || canAccept) && (
              <>
                <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                  {canAccept && !reply.isAccepted && (
                    <MenuItem onClick={() => { onAccept(reply._id); setMenuAnchor(null); }}>
                      <AcceptedIcon sx={{ mr: 1 }} fontSize="small" color="success" />
                      Mark as Answer
                    </MenuItem>
                  )}
                  {canDelete && (
                    <MenuItem onClick={() => { onDelete(reply._id); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>
                      Delete Reply
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>

          <Typography variant="body1" sx={{ mt: 1.5, mb: 2, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {reply.content}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={liked ? <LikeFilledIcon fontSize="small" /> : <LikeIcon fontSize="small" />}
              onClick={() => onLike(reply._id)}
              color={liked ? 'primary' : 'inherit'}
              sx={{ minWidth: 0 }}
            >
              {reply.likes?.length || 0}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);

  const { data, isLoading } = useQuery(
    ['discussion', id],
    () => discussionService.getById(id),
    { refetchOnWindowFocus: false }
  );

  const discussion = data?.data;
  const invalidate = () => queryClient.invalidateQueries(['discussion', id]);

  const likeMutation = useMutation(() => discussionService.toggleLike(id), {
    onSuccess: invalidate,
    onError: () => toast.error('Failed to update like'),
  });

  const replyMutation = useMutation((content) => discussionService.addReply(id, content), {
    onSuccess: () => { invalidate(); setReplyContent(''); toast.success('Reply posted!'); },
    onError: () => toast.error('Failed to post reply'),
  });

  const deleteReplyMutation = useMutation((replyId) => discussionService.deleteReply(id, replyId), {
    onSuccess: () => { invalidate(); toast.success('Reply deleted'); },
    onError: () => toast.error('Failed to delete reply'),
  });

  const likeReplyMutation = useMutation((replyId) => discussionService.toggleReplyLike(id, replyId), {
    onSuccess: invalidate,
    onError: () => toast.error('Failed to update like'),
  });

  const acceptReplyMutation = useMutation((replyId) => discussionService.acceptReply(id, replyId), {
    onSuccess: () => { invalidate(); toast.success('Answer accepted!'); },
    onError: () => toast.error('Failed to accept answer'),
  });

  const deleteDiscussionMutation = useMutation(() => discussionService.remove(id), {
    onSuccess: () => { toast.success('Discussion deleted'); navigate('/discussions'); },
    onError: () => toast.error('Failed to delete discussion'),
  });

  const handleReply = () => {
    if (!isAuthenticated) { toast.info('Please login to reply'); navigate('/login'); return; }
    if (!replyContent.trim()) { toast.warn('Reply cannot be empty'); return; }
    replyMutation.mutate(replyContent);
  };

  const handleLike = () => {
    if (!isAuthenticated) { toast.info('Please login to like'); navigate('/login'); return; }
    likeMutation.mutate();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" height={48} width="70%" />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ mt: 2, borderRadius: 2 }} />
      </Container>
    );
  }

  if (!discussion) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <ForumIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
        <Typography variant="h5">Discussion not found</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/discussions')}>Back to Hub</Button>
      </Container>
    );
  }

  const isLiked = discussion.likes?.some((id) => id === user?._id || id?._id === user?._id);
  const isOwner = user?._id === (discussion.author?._id || discussion.author);
  const isAdmin = ['admin', 'moderator'].includes(user?.role);

  return (
    <>
      <Helmet>
        <title>{discussion.title} - Discussion Hub | StudyBridge</title>
      </Helmet>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Back */}
          <Button startIcon={<BackIcon />} onClick={() => navigate('/discussions')} sx={{ mb: 3 }}>
            Back to Discussion Hub
          </Button>

          <Grid container spacing={3}>
            {/* Main */}
            <Grid item xs={12} md={8}>
              {/* Discussion */}
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={discussion.category}
                      color={CATEGORY_COLORS[discussion.category] || 'default'}
                      size="small"
                    />
                    <Chip label={discussion.country} variant="outlined" size="small" />
                    {discussion.isPinned && (
                      <Chip icon={<PinIcon />} label="Pinned" size="small" color="primary" />
                    )}
                    {discussion.isLocked && (
                      <Chip icon={<LockIcon />} label="Locked" size="small" color="default" />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h4" fontWeight={800} gutterBottom sx={{ lineHeight: 1.3 }}>
                      {discussion.title}
                    </Typography>
                    {(isOwner || isAdmin) && (
                      <>
                        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                          {(isOwner || isAdmin) && (
                            <MenuItem
                              onClick={() => { deleteDiscussionMutation.mutate(); setMenuAnchor(null); }}
                              sx={{ color: 'error.main' }}
                            >
                              Delete Discussion
                            </MenuItem>
                          )}
                        </Menu>
                      </>
                    )}
                  </Box>

                  {/* Author */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar src={discussion.author?.profilePicture} sx={{ width: 48, height: 48 }}>
                      {discussion.author?.firstName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {discussion.author?.firstName} {discussion.author?.lastName}
                        {discussion.author?.role === 'admin' && (
                          <Chip label="Admin" size="small" color="error" sx={{ ml: 1, height: 18, fontSize: 10 }} />
                        )}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Posted {format(new Date(discussion.createdAt), 'MMM d, yyyy · h:mm a')}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Content */}
                  <Typography variant="body1" sx={{ lineHeight: 1.9, whiteSpace: 'pre-wrap', mb: 3 }}>
                    {discussion.content}
                  </Typography>

                  {/* Tags */}
                  {discussion.tags?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                      {discussion.tags.map((tag) => (
                        <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ fontSize: 12 }} />
                      ))}
                    </Box>
                  )}

                  <Divider sx={{ mb: 2 }} />

                  {/* Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      startIcon={isLiked ? <LikeFilledIcon /> : <LikeIcon />}
                      onClick={handleLike}
                      color={isLiked ? 'primary' : 'inherit'}
                      variant={isLiked ? 'contained' : 'outlined'}
                      size="small"
                    >
                      {discussion.likes?.length || 0} Likes
                    </Button>
                    <Button startIcon={<ReplyIcon />} size="small" variant="outlined" onClick={() => document.getElementById('reply-box')?.focus()}>
                      {discussion.replyCount} Replies
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                      <ViewIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">{discussion.views} views</Typography>
                    </Box>
                    <Tooltip title="Copy link">
                      <IconButton size="small" onClick={handleShare}><ShareIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>

              {/* Replies */}
              {discussion.replies?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    {discussion.replyCount} {discussion.replyCount === 1 ? 'Reply' : 'Replies'}
                  </Typography>
                  {discussion.replies
                    .sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0))
                    .map((reply) => (
                      <ReplyCard
                        key={reply._id}
                        reply={reply}
                        currentUserId={user?._id}
                        discussionAuthorId={discussion.author?._id || discussion.author}
                        onLike={(replyId) => {
                          if (!isAuthenticated) { toast.info('Please login'); return; }
                          likeReplyMutation.mutate(replyId);
                        }}
                        onDelete={(replyId) => deleteReplyMutation.mutate(replyId)}
                        onAccept={(replyId) => acceptReplyMutation.mutate(replyId)}
                      />
                    ))}
                </Box>
              )}

              {/* Reply Box */}
              {discussion.isLocked ? (
                <Alert severity="info" icon={<LockIcon />}>
                  This discussion is locked. No new replies are allowed.
                </Alert>
              ) : (
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {isAuthenticated ? 'Your Reply' : 'Join the Discussion'}
                    </Typography>
                    {isAuthenticated ? (
                      <>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <Avatar src={user?.profilePicture} sx={{ width: 40, height: 40, flexShrink: 0 }}>
                            {user?.firstName?.[0]}
                          </Avatar>
                          <TextField
                            id="reply-box"
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Share your experience, tips or answer..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            inputProps={{ maxLength: 3000 }}
                            helperText={`${replyContent.length}/3000`}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            size="large"
                            onClick={handleReply}
                            disabled={replyMutation.isLoading || !replyContent.trim()}
                          >
                            {replyMutation.isLoading ? 'Posting...' : 'Post Reply'}
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography color="text.secondary" paragraph>
                          Login to share your knowledge and help fellow students
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent="center">
                          <Button variant="contained" onClick={() => navigate('/login')}>Login</Button>
                          <Button variant="outlined" onClick={() => navigate('/register')}>Sign Up</Button>
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Discussion Info */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Discussion Info
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Country</Typography>
                      <Chip label={discussion.country} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Category</Typography>
                      <Chip label={discussion.category} size="small" color={CATEGORY_COLORS[discussion.category] || 'default'} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Views</Typography>
                      <Typography variant="body2" fontWeight={600}>{discussion.views}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Replies</Typography>
                      <Typography variant="body2" fontWeight={600}>{discussion.replyCount}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Likes</Typography>
                      <Typography variant="body2" fontWeight={600}>{discussion.likes?.length || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Posted</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {format(new Date(discussion.createdAt), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Author Card */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Posted by
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={discussion.author?.profilePicture} sx={{ width: 52, height: 52 }}>
                      {discussion.author?.firstName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700}>
                        {discussion.author?.firstName} {discussion.author?.lastName}
                      </Typography>
                      {discussion.author?.role !== 'student' && (
                        <Chip label={discussion.author?.role} size="small" color="primary" />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default DiscussionDetail;
