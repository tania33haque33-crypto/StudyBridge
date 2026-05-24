import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import applicationService from '@/services/applicationService';

const steps = ['Select University', 'Choose Program', 'Application Details', 'Review'];

const CreateApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      universityId: location.state?.university?._id || '',
      programId: location.state?.program?._id || '',
      intake: '',
      intakeYear: new Date().getFullYear(),
      deadline: '',
    },
  });

  const createMutation = useMutation(applicationService.create, {
    onSuccess: (data) => {
      toast.success('Application created successfully');
      navigate(`/dashboard/applications/${data.data._id}`);
    },
    onError: () => {
      toast.error('Failed to create application');
    },
  });

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>New Application - StudyBridge</title>
      </Helmet>

      <Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Create New Application
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Start your application journey
        </Typography>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <form onSubmit={handleSubmit(onSubmit)}>
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Select University
                  </Typography>
                  <Controller
                    name="universityId"
                    control={control}
                    rules={{ required: 'University is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="University"
                        error={!!errors.universityId}
                        helperText={errors.universityId?.message}
                        disabled={location.state?.university}
                        value={location.state?.university?.name || field.value}
                      />
                    )}
                  />
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Choose Program
                  </Typography>
                  <Controller
                    name="programId"
                    control={control}
                    rules={{ required: 'Program is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Program"
                        error={!!errors.programId}
                        helperText={errors.programId?.message}
                      />
                    )}
                  />
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Application Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="intake"
                        control={control}
                        rules={{ required: 'Intake is required' }}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.intake}>
                            <InputLabel>Intake Period</InputLabel>
                            <Select {...field} label="Intake Period">
                              <MenuItem value="Fall">Fall</MenuItem>
                              <MenuItem value="Spring">Spring</MenuItem>
                              <MenuItem value="Summer">Summer</MenuItem>
                              <MenuItem value="Winter">Winter</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="intakeYear"
                        control={control}
                        rules={{ required: 'Year is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            label="Intake Year"
                            error={!!errors.intakeYear}
                            helperText={errors.intakeYear?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name="deadline"
                        control={control}
                        rules={{ required: 'Deadline is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="date"
                            label="Application Deadline"
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.deadline}
                            helperText={errors.deadline?.message}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Review Your Application
                  </Typography>
                  <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      University
                    </Typography>
                    <Typography variant="body1" fontWeight={600} gutterBottom>
                      {location.state?.university?.name}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Intake
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {watch('intake')} {watch('intakeYear')}
                    </Typography>
                  </Card>
                </Box>
              )}

              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={createMutation.isLoading}
                  >
                    {createMutation.isLoading ? 'Creating...' : 'Create Application'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default CreateApplication;