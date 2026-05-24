import { Box, Container, Typography, Paper } from '@mui/material';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - StudyBridge</title>
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
            Privacy Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              1. Information We Collect
            </Typography>
            <Typography variant="body1" paragraph>
              We collect information you provide directly to us, including name, email address,
              educational background, and preferences related to studying abroad.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              2. How We Use Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use the information we collect to provide, maintain, and improve our services,
              send you technical notices and support messages, and respond to your comments and
              questions.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              3. Information Sharing
            </Typography>
            <Typography variant="body1" paragraph>
              We do not share your personal information with third parties except as described in
              this privacy policy or with your consent.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              4. Data Security
            </Typography>
            <Typography variant="body1" paragraph>
              We take reasonable measures to help protect your personal information from loss,
              theft, misuse, unauthorized access, disclosure, alteration, and destruction.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              5. Contact Us
            </Typography>
            <Typography variant="body1">
              If you have any questions about this Privacy Policy, please contact us at
              privacy@studybridge.com
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default PrivacyPolicy;