import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar, Stack,
  Skeleton, Alert, Pagination, Divider,
} from '@mui/material';
import {
  Forum as ForumIcon,
  ThumbUp as LikeIcon,
  Reply as ReplyIcon,
  Add as AddIcon,
  Public as PublicIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import discussionService from '@/services/discussionService';
import { formatDate } from '@/utils/formatters';

const PAGE_SIZE = 10;

const CATEGORY_COLORS = {
  general: 'default',
  visa: 'warning',
  scholarship: 'success',
  accommodation: 'info',
  academics: 'primary',
  finance: 'secondary',
};

function DiscussionSkeleton() {
  return (
    <Card sx={{ borderRadius: 3, mb: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="40%" height={20} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="rounded" width={70} height={24} />
              <Skeleton variant="rounded" width={70} height={24} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function DiscussionCard({ discussion }) {
  const navigate = useNavigate();

  const categoryColor = CATEGORY_COLORS[discussion.category] || 'default';
  const hasAcceptedAnswer = discussion.replies?.some?.((r) => r.isAccepted) ||
    discussion.acceptedReplyId != null;

  return (
    <Card
      sx={{
        borderRadius: 3, mb: 2, cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4 },
      }}
      onClick={() => navigate(`/discussions/${discussion._id}`)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar
            src={discussion.author?.profilePicture}
            sx={{ width: 40, height: 40, bgcolor: 'primary.light', flexShrink: 0 }}
          >
            {discussion.author?.firstName?.[0] || '?'}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, minWidth: 0 }} noWrap title={discussion.title}>
                {discussion.title}
              </Typography>
              {hasAcceptedAnswer && (
                <Chip icon={<CheckIcon />} label="Solved" color="success" size="small" sx={{ flexShrink: 0 }} />
              )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
              {discussion.category && (
                <Chip label={discussion.category} color={categoryColor} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
              )}
              {discussion.targetCountry && (
                <Chip label={discussion.targetCountry} icon={<PublicIcon />} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
              )}
              {!discussion.isActive && (
                <Chip label="Closed" color="default" size="small" />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LikeIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{discussion.likesCount ?? discussion.likes?.length ?? 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ReplyIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">{discussion.repliesCount ?? discussion.replies?.length ?? 0} replies</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                {formatDate(discussion.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function MyDiscussions() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery(
    ['myDiscussions', page],
    () => discussionService.getMy({ page, limit: PAGE_SIZE }),
    { keepPreviousData: true, staleTime: 60_000 }
  );

  const discussions = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <>
      <Helmet><title>My Discussions – StudyBridge</title></Helmet>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>My Discussions</Typography>
            <Typography variant="body1" color="text.secondary">
              Questions and posts you've shared in the Discussion Hub
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/discussions')}>
            New Discussion
          </Button>
        </Box>

        {isLoading && Array.from({ length: 4 }).map((_, i) => <DiscussionSkeleton key={i} />)}

        {isError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Failed to load your discussions. Please refresh the page.
          </Alert>
        )}

        {!isLoading && !isError && discussions.length === 0 && (
          <Card sx={{ borderRadius: 3, textAlign: 'center', py: 8 }}>
            <CardContent>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'warning.light', mx: 'auto', mb: 3 }}>
                <ForumIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom>No Discussions Yet</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
                Ask a question or start a conversation in the Discussion Hub. Connect with students planning to study in the same country.
              </Typography>
              <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => navigate('/discussions')}>
                Start a Discussion
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && discussions.length > 0 && (
          <>
            <Stack sx={{ mb: 2 }} direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {total} discussion{total !== 1 ? 's' : ''}
              </Typography>
            </Stack>

            {discussions.map((d) => <DiscussionCard key={d._id} discussion={d} />)}

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages} page={page}
                  onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  color="primary" shape="rounded" showFirstButton showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );
}
