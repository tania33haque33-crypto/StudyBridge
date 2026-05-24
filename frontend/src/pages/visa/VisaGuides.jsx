import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Stack,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FlightTakeoff as VisaIcon,
  AttachMoney as MoneyIcon,
  Schedule as TimeIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import visaService from '@/services/visaService';
import LoadingScreen from '@/components/common/LoadingScreen';
import { formatCurrency } from '@/utils/formatters';

const VisaGuides = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery('visaGuides', visaService.getAll);

  const filteredGuides = data?.data?.filter((guide) =>
    guide.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title>Visa Guides - StudyBridge</title>
        <meta
          name="description"
          content="Country-specific visa guides and requirements for international students"
        />
      </Helmet>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Visa Guides & Requirements
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Everything you need to know about student visas
            </Typography>
          </Box>

          {/* Search */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Visa Guides */}
          <Grid container spacing={3}>
            {filteredGuides?.map((guide) => (
              <Grid item xs={12} md={6} lg={4} key={guide._id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => navigate(`/visa-guides/${guide.country.toLowerCase()}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                        }}
                      >
                        {guide.country.substring(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {guide.country}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Student Visa Guide
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={2}>
                      {guide.visaTypes?.[0] && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <VisaIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Visa Type
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {guide.visaTypes[0].name}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {guide.visaTypes?.[0]?.processingTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Processing Time
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {guide.visaTypes[0].processingTime}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {guide.visaTypes?.[0]?.fee && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MoneyIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Visa Fee
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(
                                guide.visaTypes[0].fee.amount,
                                guide.visaTypes[0].fee.currency
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {guide.postStudyWorkVisa?.available && (
                        <Chip
                          label="Post-Study Work Visa Available"
                          size="small"
                          color="success"
                        />
                      )}
                    </Stack>

                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 3 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/visa-guides/${guide.country.toLowerCase()}`);
                      }}
                    >
                      View Full Guide
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredGuides?.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" gutterBottom>
                No visa guides found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try searching for a different country
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default VisaGuides;