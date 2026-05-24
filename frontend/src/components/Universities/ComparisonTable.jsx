import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Chip,
  Rating,
  IconButton,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatters';

const ComparisonTable = ({ universities, onRemove, onApply }) => {
  const comparisonRows = [
    {
      label: 'University',
      render: (uni) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={uni.logo} sx={{ width: 50, height: 50 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {uni.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {uni.city}, {uni.country}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      label: 'QS World Ranking',
      render: (uni) => (
        <Chip
          label={uni.rankings?.qsRanking?.world ? `#${uni.rankings.qsRanking.world}` : 'N/A'}
          color="primary"
        />
      ),
    },
    {
      label: 'University Type',
      render: (uni) => <Typography>{uni.universityType}</Typography>,
    },
    {
      label: 'Student Rating',
      render: (uni) => (
        <Box>
          <Rating value={uni.averageRating || 0} readOnly precision={0.1} />
          <Typography variant="caption" color="text.secondary">
            ({uni.reviewCount || 0} reviews)
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Total Students',
      render: (uni) => (
        <Typography>{uni.stats?.totalStudents?.toLocaleString() || 'N/A'}</Typography>
      ),
    },
    {
      label: 'International Students',
      render: (uni) => (
        <Typography>{uni.stats?.internationalStudents?.toLocaleString() || 'N/A'}</Typography>
      ),
    },
    {
      label: 'Acceptance Rate',
      render: (uni) => (
        <Typography>
          {uni.stats?.acceptanceRate ? `${uni.stats.acceptanceRate}%` : 'N/A'}
        </Typography>
      ),
    },
    {
      label: 'Tuition (UG International)',
      render: (uni) => (
        <Typography fontWeight={700} color="primary.main">
          {uni.tuitionFees?.undergraduate?.international?.amount
            ? formatCurrency(
                uni.tuitionFees.undergraduate.international.amount,
                uni.tuitionFees.undergraduate.international.currency
              )
            : 'N/A'}
        </Typography>
      ),
    },
    {
      label: 'Graduation Rate',
      render: (uni) => (
        <Typography>{uni.stats?.graduationRate ? `${uni.stats.graduationRate}%` : 'N/A'}</Typography>
      ),
    },
    {
      label: 'Employment Rate',
      render: (uni) => (
        <Typography>{uni.stats?.employmentRate ? `${uni.stats.employmentRate}%` : 'N/A'}</Typography>
      ),
    },
    {
      label: 'Available Programs',
      render: (uni) => <Typography>{uni.programs?.length || 0}</Typography>,
    },
    {
      label: 'Scholarships',
      render: (uni) => (
        <Box>
          {uni.scholarships?.length > 0 ? (
            <CheckIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          )}
          <Typography variant="caption">
            {uni.scholarships?.length || 0} available
          </Typography>
        </Box>
      ),
    },
    {
      label: 'On-campus Housing',
      render: (uni) =>
        uni.campusLife?.accommodation?.available ? (
          <CheckIcon color="success" />
        ) : (
          <CancelIcon color="error" />
        ),
    },
    {
      label: 'Actions',
      render: (uni) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button variant="contained" size="small" onClick={() => onApply(uni)}>
            Apply
          </Button>
          <Button
            variant="outlined"
            size="small"
            href={`/universities/${uni.slug}`}
            target="_blank"
          >
            View Details
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Card>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200, fontWeight: 700, bgcolor: 'grey.100' }}>
                Criteria
              </TableCell>
              {universities.map((uni) => (
                <TableCell
                  key={uni._id}
                  sx={{ minWidth: 250, bgcolor: 'grey.50', position: 'relative' }}
                >
                  <IconButton
                    size="small"
                    onClick={() => onRemove(uni._id)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonRows.map((row, index) => (
              <TableRow
                key={index}
                sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>
                {universities.map((uni) => (
                  <TableCell key={uni._id}>{row.render(uni)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default ComparisonTable;