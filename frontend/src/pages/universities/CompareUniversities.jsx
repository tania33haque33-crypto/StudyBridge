import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Chip,
  Rating,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import universityService from '@/services/universityService';
import { formatCurrency } from '@/utils/formatters';

const CompareUniversities = () => {
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: comparisonData } = useQuery(
    ['compareUniversities', selectedIds],
    () => universityService.compare(selectedIds),
    {
      enabled: selectedIds.length >= 2,
    }
  );

  const handleRemove = (id) => {
    setSelectedIds(selectedIds.filter((sid) => sid !== id));
  };

  const universities = comparisonData?.data || [];

  return (
    <>
      <Helmet>
        <title>Compare Universities - StudyBridge</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Compare Universities
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Select up to 5 universities to compare side by side
        </Typography>

        {universities.length >= 2 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableBody>
                {/* University Cards */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>University</TableCell>
                  {universities.map((uni) => (
                    <TableCell key={uni._id} sx={{ minWidth: 250 }}>
                      <Card>
                        <CardContent>
                          <Box sx={{ position: 'relative' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleRemove(uni._id)}
                              sx={{ position: 'absolute', top: -8, right: -8 }}
                            >
                              <CloseIcon />
                            </IconButton>
                            <Avatar
                              src={uni.logo}
                              sx={{ width: 60, height: 60, mb: 2, mx: 'auto' }}
                            />
                            <Typography variant="h6" fontWeight={700} align="center" gutterBottom>
                              {uni.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                              {uni.city}, {uni.country}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                              <Rating value={uni.averageRating} readOnly size="small" />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Rankings */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>QS World Ranking</TableCell>
                  {universities.map((uni) => (
                    <TableCell key={uni._id}>
                      {uni.rankings?.qsRanking?.world ? (
                        <Chip label={`#${uni.rankings.qsRanking.world}`} color="primary" />
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* University Type */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  {universities.map((uni) => (
                    <TableCell key={uni._id}>{uni.universityType}</TableCell>
                  ))}
                </TableRow>

                {/* Total Students */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total Students</TableCell>
                  {universities.map((uni) => (
                    <TableCell key={uni._id}>
                      {uni.stats?.totalStudents?.toLocaleString() || 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Acceptance Rate */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Acceptance Rate</TableCell>
                  {universities.map((uni) => (
                    <TableCell key={uni._id}>
                      {uni.stats?.acceptanceRate ? `${uni.stats.acceptanceRate}%` : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Tuition Fees */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Tuition (International UG)</TableCell>
                  {universities.map((uni) => (
                    <TableCell key={uni._id}>
                      {uni.tuitionFees?.undergraduate?.international?.amount
                        ? formatCurrency(
                            uni.tuitionFees.undergraduate.international.amount,
                            uni.tuitionFees.undergraduate.international.currency
                          )
                        : 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Programs Count */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Available Programs</TableCell>
                  {universities.map((uni) => (
                    <TableCell key={uni._id}>{uni.programs?.length || 0}</TableCell>
                  ))}
                </TableRow>

                {/* Average Rating */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Student Rating</TableCell>
                  {universities.map((uni) => (
                    <TableCell key={uni._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={uni.averageRating} readOnly size="small" />
                        <Typography variant="body2">({uni.reviewCount || 0})</Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Actions */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  {universities.map((uni) => (
                    <TableCell key={uni._id}>
                      <Button variant="contained" fullWidth size="small">
                        View Details
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" gutterBottom>
              Select universities to compare
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You need to select at least 2 universities to start comparison
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 3 }}
              href="/universities"
            >
              Browse Universities
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
};

export default CompareUniversities;