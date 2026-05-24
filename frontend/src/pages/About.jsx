import { Box, Container, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  EmojiEvents as AwardIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

const stats = [
  { icon: <SchoolIcon />, value: '10,000+', label: 'Partner Universities' },
  { icon: <PeopleIcon />, value: '50,000+', label: 'Students Helped' },
  { icon: <TrendingIcon />, value: '95%', label: 'Success Rate' },
  { icon: <AwardIcon />, value: '$100M+', label: 'Scholarships Awarded' },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - StudyBridge</title>
        <meta
          name="description"
          content="Learn about StudyBridge's mission to make international education accessible to everyone."
        />
      </Helmet>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
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
              About StudyBridge
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
              We're on a mission to make international education accessible to students worldwide
            </Typography>
          </Box>

          {/* Stats */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card sx={{ textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'primary.main',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Mission */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              At StudyBridge, we believe that every student deserves access to quality international
              education. Our platform connects ambitious students with world-class universities and
              provides comprehensive guidance throughout the entire application process.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We've helped over 50,000 students achieve their dreams of studying abroad, and we're
              committed to making the process simpler, more transparent, and more accessible for
              everyone.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default About;