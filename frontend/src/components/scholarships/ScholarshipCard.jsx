import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { formatCurrency, formatDate, daysUntil } from '@/utils/formatters';

const ScholarshipCard = ({ scholarship, onSave, isSaved = false }) => {
  const navigate = useNavigate();
  const daysRemaining = daysUntil(scholarship.deadline);
  const isUrgent = daysRemaining < 30;

  const handleCardClick = () => {
    navigate(`/scholarships/${scholarship._id}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave(scholarship._id);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderLeft: isUrgent ? 4 : 0,
        borderColor: 'error.main',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header with Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1, pr: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {scholarship.name}
            </Typography>
          </Box>
          <IconButton
            onClick={handleSaveClick}
            size="small"
            sx={{
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            {isSaved ? <BookmarkedIcon color="primary" /> : <BookmarkIcon />}
          </IconButton>
        </Box>

        {/* Provider */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {scholarship.provider}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip label={scholarship.type} size="small" color="primary" />
          <Chip
            icon={<PublicIcon sx={{ fontSize: 16 }} />}
            label={scholarship.country}
            size="small"
            variant="outlined"
          />
          {scholarship.studyLevel?.slice(0, 2).map((level) => (
            <Chip key={level} label={level} size="small" variant="outlined" />
          ))}
        </Stack>

        {/* Amount */}
        <Box
          sx={{
            bgcolor: 'primary.lighter',
            borderRadius: 2,
            p: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <MoneyIcon color="primary" />
            <Typography variant="caption" color="text.secondary">
              Scholarship Amount
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            {formatCurrency(scholarship.amount.value, scholarship.amount.currency)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {scholarship.amount.type}
          </Typography>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 2,
          }}
        >
          {scholarship.description}
        </Typography>

        {/* Deadline Alert */}
        <Box
          sx={{
            bgcolor: isUrgent ? 'error.lighter' : 'info.lighter',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EventIcon fontSize="small" color={isUrgent ? 'error' : 'info'} />
            <Typography variant="caption" color="text.secondary">
              Application Deadline
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={700}>
            {formatDate(scholarship.deadline)}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            color={isUrgent ? 'error.main' : 'text.secondary'}
          >
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Deadline passed'}
          </Typography>
          {isUrgent && daysRemaining > 0 && (
            <LinearProgress
              variant="determinate"
              value={((30 - daysRemaining) / 30) * 100}
              color="error"
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          )}
        </Box>

        {/* Coverage Highlights */}
        {scholarship.coverage && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Coverage Includes:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
              {scholarship.coverage.tuition && (
                <Chip label="Tuition" size="small" variant="outlined" color="success" />
              )}
              {scholarship.coverage.accommodation && (
                <Chip label="Accommodation" size="small" variant="outlined" color="success" />
              )}
              {scholarship.coverage.livingExpenses && (
                <Chip label="Living" size="small" variant="outlined" color="success" />
              )}
            </Stack>
          </Box>
        )}
      </CardContent>

      {/* Action Button */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleCardClick}
          sx={{ fontWeight: 600 }}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
};

export default ScholarshipCard;