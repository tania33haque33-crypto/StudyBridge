import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, Stack,
  Skeleton, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  TextField, ToggleButton, ToggleButtonGroup, Switch, FormControlLabel, IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Public as PublicIcon,
  AttachMoney as BudgetIcon,
  TravelExplore as FinderIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Score as ScoreIcon,
  People as CommunityIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import studyProfileService from '@/services/studyProfileService';

const POPULAR_COUNTRIES = [
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany',
  'Netherlands', 'Sweden', 'Denmark', 'Finland', 'Norway',
  'Malaysia', 'Japan', 'South Korea', 'Singapore', 'Ireland',
  'New Zealand', 'China', 'Turkey',
];

const SUBJECTS = [
  'Computer Science', 'Software Engineering', 'Data Science & AI',
  'Business Administration', 'Electrical Engineering', 'Civil Engineering',
  'Mechanical Engineering', 'Medicine & Health', 'Pharmacy', 'Architecture',
  'Economics & Finance', 'Mathematics', 'Physics', 'Chemistry', 'Law',
  'Biotechnology', 'Agriculture', 'Textile Engineering',
];

const LEVEL_COLORS = { Bachelor: 'primary', Master: 'secondary', PhD: 'error' };

// ─── Edit Dialog ────────────────────────────────────────────────────────────────

function EditProfileDialog({ open, onClose, existing }) {
  const queryClient = useQueryClient();
  const [studyLevel, setStudyLevel] = useState(existing?.studyLevel || 'Master');
  const [countries, setCountries] = useState(existing?.preferredCountries || []);
  const [subjects, setSubjects] = useState(existing?.preferredSubjects || []);
  const [gpa, setGpa] = useState(existing?.bachelorCGPA || existing?.hscGPA || '');
  const [ielts, setIelts] = useState(existing?.ieltsOverall || '');
  const [budgetMin, setBudgetMin] = useState(existing?.budgetMin ?? 5000);
  const [budgetMax, setBudgetMax] = useState(existing?.budgetMax ?? 25000);
  const [futureGoals, setFutureGoals] = useState(existing?.futureGoals || '');
  const [isPublic, setIsPublic] = useState(existing?.isPublic ?? false);
  const [shareAnon, setShareAnon] = useState(existing?.shareAnonymously ?? false);
  const [displayName, setDisplayName] = useState(existing?.displayName || '');

  const toggleChip = (val, state, setter) =>
    setter(state.includes(val) ? state.filter((x) => x !== val) : [...state, val]);

  const mutation = useMutation(studyProfileService.save, {
    onSuccess: () => {
      queryClient.invalidateQueries('myStudyProfile');
      queryClient.invalidateQueries('communityProfiles');
      toast.success('Study profile saved!');
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to save profile.'),
  });

  const handleSave = () => {
    if (!studyLevel) { toast.warn('Please select a study level.'); return; }
    if (countries.length === 0) { toast.warn('Please select at least one target country.'); return; }
    mutation.mutate({
      studyLevel,
      preferredCountries: countries,
      preferredSubjects: subjects,
      ...(studyLevel === 'Bachelor' ? { hscGPA: parseFloat(gpa) || undefined } : { bachelorCGPA: parseFloat(gpa) || undefined }),
      hasIELTS: !!ielts,
      ieltsOverall: parseFloat(ielts) || undefined,
      budgetMin: parseInt(budgetMin) || 0,
      budgetMax: parseInt(budgetMax) || 50000,
      futureGoals,
      isPublic,
      shareAnonymously: shareAnon,
      displayName: shareAnon ? '' : displayName,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color="primary" />
          {existing ? 'Edit Study Profile' : 'Create Study Profile'}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>Study Level *</Typography>
          <ToggleButtonGroup value={studyLevel} exclusive onChange={(_, v) => v && setStudyLevel(v)} fullWidth size="small">
            <ToggleButton value="Bachelor">Bachelor</ToggleButton>
            <ToggleButton value="Master">Master</ToggleButton>
            <ToggleButton value="PhD">PhD</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Target Countries * {countries.length > 0 && `(${countries.length})`}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {POPULAR_COUNTRIES.map((c) => (
              <Chip key={c} label={c} size="small" onClick={() => toggleChip(c, countries, setCountries)}
                color={countries.includes(c) ? 'primary' : 'default'}
                variant={countries.includes(c) ? 'filled' : 'outlined'} sx={{ cursor: 'pointer' }} />
            ))}
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Preferred Subjects {subjects.length > 0 && `(${subjects.length})`}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {SUBJECTS.map((s) => (
              <Chip key={s} label={s} size="small" onClick={() => toggleChip(s, subjects, setSubjects)}
                color={subjects.includes(s) ? 'secondary' : 'default'}
                variant={subjects.includes(s) ? 'filled' : 'outlined'} sx={{ cursor: 'pointer' }} />
            ))}
          </Box>
        </Box>

        <Divider />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label={studyLevel === 'Bachelor' ? 'HSC GPA (out of 5)' : 'Bachelor CGPA (out of 4)'}
              type="number" fullWidth size="small" value={gpa} onChange={(e) => setGpa(e.target.value)}
              inputProps={{ min: 0, max: studyLevel === 'Bachelor' ? 5 : 4, step: 0.01 }}
              placeholder={studyLevel === 'Bachelor' ? 'e.g. 4.83' : 'e.g. 3.75'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="IELTS Overall Band" type="number" fullWidth size="small" value={ielts}
              onChange={(e) => setIelts(e.target.value)} inputProps={{ min: 0, max: 9, step: 0.5 }} placeholder="e.g. 6.5" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Min Budget (USD/yr)" type="number" fullWidth size="small" value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)} inputProps={{ min: 0 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Max Budget (USD/yr)" type="number" fullWidth size="small" value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)} inputProps={{ min: 0 }} />
          </Grid>
        </Grid>

        <Divider />

        <TextField
          label="Future Goals" multiline rows={3} fullWidth value={futureGoals}
          onChange={(e) => setFutureGoals(e.target.value)}
          placeholder="Describe your study goals, career plans..."
          inputProps={{ maxLength: 500 }} helperText={`${futureGoals.length}/500`} />

        <Divider />

        <Box>
          <FormControlLabel
            control={<Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} color="primary" />}
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isPublic ? <LockOpenIcon fontSize="small" color="success" /> : <LockIcon fontSize="small" color="disabled" />}
              <Typography variant="body2">{isPublic ? 'Visible in Student Community' : 'Private (only you can see this)'}</Typography>
            </Box>}
          />
          {isPublic && (
            <>
              <FormControlLabel sx={{ mt: 1, ml: 0.5 }}
                control={<Switch checked={shareAnon} onChange={(e) => setShareAnon(e.target.checked)} size="small" />}
                label={<Typography variant="body2">Share anonymously</Typography>}
              />
              {!shareAnon && (
                <TextField label="Display Name" fullWidth size="small" value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Name shown to other students" sx={{ mt: 1.5 }} />
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={mutation.isLoading} startIcon={<EditIcon />}>
          {mutation.isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Profile Display ───────────────────────────────────────────────────────────

function ProfileDisplay({ profile }) {
  const gpaLabel = profile.studyLevel === 'Bachelor'
    ? profile.hscGPA != null ? `HSC GPA: ${profile.hscGPA} / 5.0` : null
    : profile.bachelorCGPA != null ? `Bachelor CGPA: ${profile.bachelorCGPA} / 4.0` : null;

  const rows = [
    { label: 'Study Level', value: <Chip label={profile.studyLevel} color={LEVEL_COLORS[profile.studyLevel] || 'default'} size="small" /> },
    gpaLabel && { label: 'Academic Score', value: gpaLabel },
    profile.hasIELTS && profile.ieltsOverall != null && { label: 'IELTS', value: `${profile.ieltsOverall} overall` },
    (profile.budgetMin != null || profile.budgetMax != null) && {
      label: 'Budget',
      value: `$${(profile.budgetMin ?? 0).toLocaleString()} – $${(profile.budgetMax ?? 0).toLocaleString()} / year`,
    },
    profile.futureGoals && { label: 'Goals', value: profile.futureGoals },
  ].filter(Boolean);

  return (
    <Stack spacing={2.5}>
      {rows.map((row) => (
        <Box key={row.label}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {row.label}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            {typeof row.value === 'string'
              ? <Typography variant="body1">{row.value}</Typography>
              : row.value}
          </Box>
        </Box>
      ))}

      {profile.preferredCountries?.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Target Countries
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
            {profile.preferredCountries.map((c) => (
              <Chip key={c} label={c} size="small" icon={<PublicIcon />} variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      {profile.preferredSubjects?.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Preferred Subjects
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
            {profile.preferredSubjects.map((s) => (
              <Chip key={s} label={s} size="small" icon={<SchoolIcon />} variant="outlined" color="primary" />
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MyStudyProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, isError } = useQuery('myStudyProfile', studyProfileService.getMy, {
    staleTime: 60_000,
  });

  const profile = data?.data;

  const visibilityMutation = useMutation(
    (isPublic) => studyProfileService.save({ ...profile, isPublic }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myStudyProfile');
        queryClient.invalidateQueries('communityProfiles');
        toast.success(profile?.isPublic ? 'Profile is now private.' : 'Profile is now public in the community!');
      },
      onError: () => toast.error('Failed to update visibility.'),
    }
  );

  return (
    <>
      <Helmet><title>My Study Profile – StudyBridge</title></Helmet>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>My Study Profile</Typography>
            <Typography variant="body1" color="text.secondary">
              Your academic background and study-abroad preferences
            </Typography>
          </Box>
          {profile && (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                Edit Profile
              </Button>
              <Button
                variant="contained"
                startIcon={<FinderIcon />}
                onClick={() => navigate('/university-finder')}
              >
                Find Matches
              </Button>
            </Stack>
          )}
        </Box>

        {isLoading && (
          <Grid container spacing={3}>
            {[0, 1].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" width="50%" height={32} />
                    <Skeleton variant="text" width="80%" sx={{ mt: 2 }} />
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="60%" />
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Skeleton variant="rounded" width={80} height={28} />
                      <Skeleton variant="rounded" width={80} height={28} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {isError && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            Failed to load your study profile. Please refresh the page.
          </Alert>
        )}

        {!isLoading && !isError && !profile && (
          <Card sx={{ borderRadius: 3, textAlign: 'center', py: 8 }}>
            <CardContent>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light', mx: 'auto', mb: 3 }}>
                <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                No Study Profile Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
                Create your study profile to get personalized university matches and connect with peers planning the same journey.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button variant="contained" size="large" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                  Create Profile
                </Button>
                <Button variant="outlined" size="large" startIcon={<FinderIcon />} onClick={() => navigate('/university-finder')}>
                  Try University Finder
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {!isLoading && profile && (
          <Grid container spacing={3}>
            {/* Profile details */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>Profile Details</Typography>
                    <Chip
                      icon={profile.isPublic ? <LockOpenIcon /> : <LockIcon />}
                      label={profile.isPublic ? 'Public' : 'Private'}
                      color={profile.isPublic ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <ProfileDisplay profile={profile} />
                </CardContent>
              </Card>
            </Grid>

            {/* Actions sidebar */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Quick Actions</Typography>
                    <Stack spacing={1.5}>
                      <Button variant="contained" fullWidth startIcon={<FinderIcon />} onClick={() => navigate('/university-finder')}>
                        Find Matching Universities
                      </Button>
                      <Button variant="outlined" fullWidth startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                        Edit Profile
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<CommunityIcon />}
                        onClick={() => navigate('/community')}
                      >
                        View in Community
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Community Visibility</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {profile.isPublic
                        ? 'Your profile is visible to other students in the community.'
                        : 'Your profile is private. Make it public to connect with peers.'}
                    </Typography>
                    <Button
                      variant={profile.isPublic ? 'outlined' : 'contained'}
                      color={profile.isPublic ? 'error' : 'primary'}
                      fullWidth
                      startIcon={profile.isPublic ? <LockIcon /> : <ShareIcon />}
                      onClick={() => visibilityMutation.mutate(!profile.isPublic)}
                      disabled={visibilityMutation.isLoading}
                    >
                      {profile.isPublic ? 'Make Private' : 'Share with Community'}
                    </Button>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Box>

      <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} existing={profile} />
    </>
  );
}
