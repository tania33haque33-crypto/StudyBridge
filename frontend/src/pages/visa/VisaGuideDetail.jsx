import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import visaService from '@/services/visaService';
import LoadingScreen from '@/components/common/LoadingScreen';
import { formatCurrency } from '@/utils/formatters';

const VisaGuideDetail = () => {
  const { country } = useParams();

  const { data, isLoading } = useQuery(['visaGuide', country], () =>
    visaService.getByCountry(country)
  );

  if (isLoading) return <LoadingScreen />;

  const guide = data?.data;

  if (!guide) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Visa guide not found</Typography>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{guide.country} Student Visa Guide - StudyBridge</title>
      </Helmet>

      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              {guide.country} Student Visa Guide
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Complete guide to obtaining a student visa for {guide.country}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Download PDF
              </Button>
              <Button variant="outlined" startIcon={<PrintIcon />}>
                Print Guide
              </Button>
            </Stack>
          </Box>

          <Grid container spacing={3}>
            {/* Main Content */}
            <Grid item xs={12} md={8}>
              {/* Visa Types */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Visa Types
                  </Typography>
                  {guide.visaTypes?.map((visa, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {visa.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {visa.description}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {visa.duration}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Processing Time
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {visa.processingTime}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Visa Fee
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(visa.fee.amount, visa.fee.currency)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </CardContent>
              </Card>

              {/* General Requirements */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    General Requirements
                  </Typography>
                  <List>
                    {guide.generalRequirements?.map((req, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={req} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Required Documents */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Required Documents
                  </Typography>
                  {guide.requiredDocuments?.map((doc, index) => (
                    <Accordion key={index}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Typography fontWeight={600}>{doc.name}</Typography>
                          {doc.mandatory && (
                            <Chip label="Required" size="small" color="error" />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary">
                          {doc.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Format: {doc.format}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>

              {/* Application Process */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Application Process
                  </Typography>
                  {guide.applicationProcess?.map((step, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Chip label={`Step ${step.step}`} color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          {step.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                      {step.estimatedTime && (
                        <Typography variant="caption" color="text.secondary">
                          Estimated Time: {step.estimatedTime}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>

              {/* Post-Study Work Visa */}
              {guide.postStudyWorkVisa?.available && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Post-Study Work Visa
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {guide.postStudyWorkVisa.duration}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Eligibility
                        </Typography>
                        <List dense>
                          {guide.postStudyWorkVisa.eligibility?.map((item, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              {/* Financial Requirements */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Financial Requirements
                  </Typography>
                  {guide.financialRequirements?.minimumBankBalance && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Minimum Bank Balance
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="primary.main">
                        {formatCurrency(
                          guide.financialRequirements.minimumBankBalance.amount,
                          guide.financialRequirements.minimumBankBalance.currency
                        )}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Proof of Funds
                  </Typography>
                  <List dense>
                    {guide.financialRequirements?.proofOfFunds?.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Medical Requirements */}
              {guide.medicalRequirements && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Medical Requirements
                    </Typography>
                    <Stack spacing={2}>
                      {guide.medicalRequirements.medicalExamRequired && (
                        <Chip label="Medical Exam Required" color="warning" />
                      )}
                      {guide.medicalRequirements.vaccinationsRequired?.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Vaccinations Required
                          </Typography>
                          {guide.medicalRequirements.vaccinationsRequired.map((vac, index) => (
                            <Chip key={index} label={vac} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      )}
                      {guide.medicalRequirements.healthInsurance?.required && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Health Insurance
                          </Typography>
                          <Typography variant="body2">
                            Minimum Coverage:{' '}
                            {formatCurrency(
                              guide.medicalRequirements.healthInsurance.minimumCoverage,
                              guide.medicalRequirements.healthInsurance.currency
                            )}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Useful Links */}
              {guide.usefulLinks?.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Useful Links
                    </Typography>
                    <List>
                      {guide.usefulLinks.map((link, index) => (
                        <ListItem
                          key={index}
                          component="a"
                          href={link.url}
                          target="_blank"
                          sx={{ px: 0 }}
                        >
                          <ListItemText
                            primary={link.title}
                            primaryTypographyProps={{
                              color: 'primary',
                              sx: { '&:hover': { textDecoration: 'underline' } },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default VisaGuideDetail;