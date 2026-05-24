import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Rating,
  IconButton,
  Stack,
  Button,
} from '@mui/material';
import {
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  LocationOn as LocationIcon,
  TrendingUp as RankingIcon,
} from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatters';
import SafeImage from '@/components/common/SafeImage';

const UniversityCard = ({ university, onSave, isSaved = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/universities/${university.slug}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave(university._id);
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
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6,
        },
      }}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <Box sx={{ position: 'relative' }}>
        <SafeImage
          src={university.coverImage}
          alt={university.name}
          seed={university._id || university.name}
          height={200}
          width="100%"
          sx={{ objectFit: 'cover', display: 'block' }}
        />
        <IconButton
          onClick={handleSaveClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 1)',
              transform: 'scale(1.1)',
            },
          }}
        >
          {isSaved ? (
            <BookmarkedIcon color="primary" />
          ) : (
            <BookmarkIcon />
          )}
        </IconButton>

        {/* Featured Badge */}
        {university.isFeatured && (
          <Chip
            label="Featured"
            size="small"
            color="secondary"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 700,
            }}
          />
        )}

        {/* Logo Overlay */}
        <SafeImage
          src={university.logo}
          alt={`${university.name} logo`}
          seed={(university._id || university.name) + '-logo'}
          fallbackIcon
          sx={{
            position: 'absolute',
            bottom: -25,
            left: 16,
            width: 60,
            height: 60,
            borderRadius: 2,
            border: '3px solid white',
            bgcolor: 'white',
            objectFit: 'contain',
            p: 0.5,
            boxShadow: 2,
          }}
        />
      </Box>

      {/* Content Section */}
      <CardContent sx={{ flexGrow: 1, pt: 4 }}>
        {/* University Name */}
        <Typography
          variant="h6"
          fontWeight={700}
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 56,
          }}
        >
          {university.name}
        </Typography>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <LocationIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {university.city}, {university.country}
          </Typography>
        </Box>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating value={university.averageRating || 0} readOnly size="small" precision={0.1} />
          <Typography variant="body2" color="text.secondary">
            ({university.reviewCount || 0})
          </Typography>
        </Box>

        {/* Tags */}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 0.5 }}>
          {university.rankings?.qsRanking?.world && (
            <Chip
              icon={<RankingIcon />}
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
          {university.isVerified && (
            <Chip
              label="Verified"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Stack>

        {/* Tuition Fee */}
        {university.tuitionFees?.undergraduate?.international?.amount && (
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary">
              From
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {formatCurrency(
                university.tuitionFees.undergraduate.international.amount,
                university.tuitionFees.undergraduate.international.currency
              )}
              <Typography component="span" variant="caption" color="text.secondary">
                /year
              </Typography>
            </Typography>
          </Box>
        )}

        {/* Stats */}
        {university.stats && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {university.stats.totalStudents && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Students
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {university.stats.totalStudents.toLocaleString()}
                </Typography>
              </Box>
            )}
            {university.stats.acceptanceRate && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Acceptance
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {university.stats.acceptanceRate}%
                </Typography>
              </Box>
            )}
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

export default UniversityCard;