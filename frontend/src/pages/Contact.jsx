import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

const contactInfo = [
  {
    icon: <EmailIcon />,
    title: 'Email',
    value: 'support@studybridge.com',
    link: 'mailto:support@studybridge.com',
  },
  {
    icon: <PhoneIcon />,
    title: 'Phone',
    value: '+1 (555) 123-4567',
    link: 'tel:+15551234567',
  },
  {
    icon: <LocationIcon />,
    title: 'Office',
    value: '123 Education St, New York, NY 10001',
    link: null,
  },
];

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - StudyBridge</title>
      </Helmet>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
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
              Get in Touch
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Have questions? We'd love to hear from you
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* Contact Info */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {contactInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: 'primary.main' }}>{info.icon}</Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            {info.title}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {info.link ? (
                              <a href={info.link} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {info.value}
                              </a>
                            ) : (
                              info.value
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="First Name"
                            {...register('firstName', { required: 'First name is required' })}
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            {...register('lastName', { required: 'Last name is required' })}
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                          />
                        </Grid>
                      </Grid>

                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email',
                          },
                        })}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />

                      <TextField
                        fullWidth
                        label="Subject"
                        {...register('subject', { required: 'Subject is required' })}
                        error={!!errors.subject}
                        helperText={errors.subject?.message}
                      />

                      <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={6}
                        {...register('message', { required: 'Message is required' })}
                        error={!!errors.message}
                        helperText={errors.message?.message}
                      />

                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ fontWeight: 700 }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Contact;