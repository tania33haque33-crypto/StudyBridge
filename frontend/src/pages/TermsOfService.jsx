import { Box, Container, Typography, Paper } from '@mui/material';
import { Helmet } from 'react-helmet-async';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - StudyBridge</title>
      </Helmet>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            fontWeight={800}
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Terms of Service
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body1" paragraph>
              By accessing and using StudyBridge, you accept and agree to be bound by the terms
              and provision of this agreement.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              2. Use License
            </Typography>
            <Typography variant="body1" paragraph>
              Permission is granted to temporarily access the materials on StudyBridge for
              personal, non-commercial use only.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              3. User Accounts
            </Typography>
            <Typography variant="body1" paragraph>
              You are responsible for maintaining the confidentiality of your account and password.
              You agree to accept responsibility for all activities that occur under your account.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              4. Disclaimer
            </Typography>
            <Typography variant="body1" paragraph>
              The materials on StudyBridge are provided on an 'as is' basis. StudyBridge makes no
              warranties, expressed or implied, and hereby disclaims and negates all other
              warranties.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              5. Limitations
            </Typography>
            <Typography variant="body1" paragraph>
              In no event shall StudyBridge or its suppliers be liable for any damages arising out
              of the use or inability to use the materials on StudyBridge.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              6. Contact
            </Typography>
            <Typography variant="body1">
              Questions about the Terms of Service should be sent to us at legal@studybridge.com
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default TermsOfService;