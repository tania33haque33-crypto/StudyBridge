import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box, Container, Grid, Card, CardContent, Typography, Chip, Avatar,
  Select, MenuItem, FormControl, InputLabel, Pagination, Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Skeleton,
  Stack, TextField, Switch, FormControlLabel, ToggleButton, ToggleButtonGroup,
  IconButton, InputAdornment, LinearProgress, Tooltip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Public as PublicIcon,
  Score as ScoreIcon,
  AttachMoney as BudgetIcon,
  People as PeopleIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  TravelExplore as FinderIcon,
  Translate as LangIcon,
  EmojiObjects as GoalsIcon,
  AccountBalance as UniversityIcon,
  VerifiedUser as IeltsIcon,
} from '@mui/icons-material';
import studyProfileService from '@/services/studyProfileService';
import useAuthStore from '@/store/authStore';

// ─── Constants ─────────────────────────────────────────────────────────────────

const FLAGS = {
  'United Kingdom': '🇬🇧', 'United States': '🇺🇸', 'Canada': '🇨🇦',
  'Australia': '🇦🇺', 'Germany': '🇩🇪', 'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Norway': '🇳🇴',
  'Malaysia': '🇲🇾', 'Japan': '🇯🇵', 'South Korea': '🇰🇷',
  'Singapore': '🇸🇬', 'Ireland': '🇮🇪', 'New Zealand': '🇳🇿',
  'China': '🇨🇳', 'Turkey': '🇹🇷',
};

const POPULAR_COUNTRIES = Object.keys(FLAGS);

const SUBJECTS = [
  'Computer Science', 'Software Engineering', 'Data Science & AI',
  'Business Administration', 'Electrical Engineering', 'Civil Engineering',
  'Mechanical Engineering', 'Medicine & Health', 'Pharmacy', 'Architecture',
  'Economics & Finance', 'Mathematics', 'Physics', 'Chemistry', 'Law',
  'Biotechnology', 'Agriculture', 'Textile Engineering',
];

const LEVEL_COLOR = { Bachelor: '#2563EB', Master: '#7C3AED', PhD: '#DC2626' };
const LEVEL_LIGHT = { Bachelor: '#EFF6FF', Master: '#F5F3FF', PhD: '#FFF1F2' };
const LEVEL_MUI  = { Bachelor: 'primary', Master: 'secondary', PhD: 'error' };
const STUDY_LEVELS = ['All', 'Bachelor', 'Master', 'PhD'];
const PAGE_SIZE = 9;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name || name === 'Anonymous') return '?';
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarBg(name, level) {
  if (level && LEVEL_COLOR[level]) return LEVEL_COLOR[level];
  const palette = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#0891B2'];
  return palette[(name?.charCodeAt(0) || 0) % palette.length];
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

function profileCompletion(p) {
  let score = 0;
  if (p.studyLevel) score++;
  if (p.preferredCountries?.length > 0) score++;
  if (p.preferredSubjects?.length > 0) score++;
  if (p.hscGPA || p.bachelorCGPA) score++;
  if (p.hasIELTS && p.ieltsOverall) score++;
  if (p.budgetMax > 0) score++;
  if (p.futureGoals) score++;
  return score;
}

function getDisplayName(profile) {
  if (profile.shareAnonymously) return 'Anonymous';
  if (profile.displayName) return profile.displayName;
  if (profile.user?.firstName)
    return `${profile.user.firstName} ${profile.user.lastName || ''}`.trim();
  return 'Anonymous';
}

// ─── Share / Edit Profile Dialog ───────────────────────────────────────────────

function ShareProfileDialog({ open, onClose, existingProfile }) {
  const queryClient = useQueryClient();
  const [studyLevel, setStudyLevel] = useState(existingProfile?.studyLevel || 'Master');
  const [selectedCountries, setSelectedCountries] = useState(existingProfile?.preferredCountries || []);
  const [selectedSubjects, setSelectedSubjects] = useState(existingProfile?.preferredSubjects || []);
  const [gpa, setGpa] = useState(existingProfile?.bachelorCGPA || existingProfile?.hscGPA || '');
  const [ielts, setIelts] = useState(existingProfile?.ieltsOverall || '');
  const [budgetMin, setBudgetMin] = useState(existingProfile?.budgetMin ?? 5000);
  const [budgetMax, setBudgetMax] = useState(existingProfile?.budgetMax ?? 25000);
  const [futureGoals, setFutureGoals] = useState(existingProfile?.futureGoals || '');
  const [shareAnon, setShareAnon] = useState(existingProfile?.shareAnonymously || false);
  const [displayName, setDisplayName] = useState(existingProfile?.displayName || '');

  const toggle = (val, state, setter) =>
    setter(state.includes(val) ? state.filter((x) => x !== val) : [...state, val]);

  const mutation = useMutation(studyProfileService.save, {
    onSuccess: () => {
      queryClient.invalidateQueries('communityProfiles');
      queryClient.invalidateQueries('communityStats');
      queryClient.invalidateQueries('myStudyProfile');
      toast.success(existingProfile ? 'Profile updated!' : 'Profile shared with the community!');
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to save. Please try again.'),
  });

  const handleSubmit = () => {
    if (!studyLevel) { toast.warn('Please select a study level.'); return; }
    if (selectedCountries.length === 0) { toast.warn('Please select at least one target country.'); return; }
    mutation.mutate({
      studyLevel,
      preferredCountries: selectedCountries,
      preferredSubjects: selectedSubjects,
      ...(studyLevel === 'Bachelor' ? { hscGPA: parseFloat(gpa) || undefined } : { bachelorCGPA: parseFloat(gpa) || undefined }),
      hasIELTS: !!ielts,
      ieltsOverall: parseFloat(ielts) || undefined,
      budgetMin: parseInt(budgetMin) || 0,
      budgetMax: parseInt(budgetMax) || 50000,
      futureGoals,
      isPublic: true,
      shareAnonymously: shareAnon,
      displayName: shareAnon ? '' : displayName,
    });
  };

  const levelColor = LEVEL_COLOR[studyLevel] || '#7C3AED';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ background: `linear-gradient(135deg, ${levelColor}dd, ${levelColor})`, p: 2.5, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShareIcon />
            <Typography variant="h6" fontWeight={700}>
              {existingProfile ? 'Update Your Community Profile' : 'Share Your Profile'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
        {/* Study Level */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>Study Level *</Typography>
          <ToggleButtonGroup value={studyLevel} exclusive onChange={(_, v) => v && setStudyLevel(v)} fullWidth size="small">
            {['Bachelor', 'Master', 'PhD'].map((l) => (
              <ToggleButton key={l} value={l} sx={{ '&.Mui-selected': { bgcolor: `${LEVEL_COLOR[l]}15`, color: LEVEL_COLOR[l], borderColor: `${LEVEL_COLOR[l]}60`, fontWeight: 700 } }}>
                {l}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Divider />

        {/* Target Countries */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Target Countries *{selectedCountries.length > 0 && <Chip label={selectedCountries.length} size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: '0.7rem' }} />}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {POPULAR_COUNTRIES.map((c) => (
              <Chip key={c} label={`${FLAGS[c] || ''} ${c}`} size="small"
                onClick={() => toggle(c, selectedCountries, setSelectedCountries)}
                color={selectedCountries.includes(c) ? 'primary' : 'default'}
                variant={selectedCountries.includes(c) ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer', fontSize: '0.75rem' }} />
            ))}
          </Box>
        </Box>

        <Divider />

        {/* Preferred Subjects */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Preferred Subjects{selectedSubjects.length > 0 && <Chip label={selectedSubjects.length} size="small" color="secondary" sx={{ ml: 1, height: 18, fontSize: '0.7rem' }} />}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {SUBJECTS.map((s) => (
              <Chip key={s} label={s} size="small"
                onClick={() => toggle(s, selectedSubjects, setSelectedSubjects)}
                color={selectedSubjects.includes(s) ? 'secondary' : 'default'}
                variant={selectedSubjects.includes(s) ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer', fontSize: '0.75rem' }} />
            ))}
          </Box>
        </Box>

        <Divider />

        {/* Academic + IELTS + Budget */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label={studyLevel === 'Bachelor' ? 'HSC GPA (out of 5)' : 'Bachelor CGPA (out of 4)'}
              type="number" fullWidth size="small" value={gpa} onChange={(e) => setGpa(e.target.value)}
              inputProps={{ min: 0, max: studyLevel === 'Bachelor' ? 5 : 4, step: 0.01 }}
              placeholder={studyLevel === 'Bachelor' ? 'e.g. 4.83' : 'e.g. 3.75'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="IELTS Overall Band" type="number" fullWidth size="small" value={ielts}
              onChange={(e) => setIelts(e.target.value)} inputProps={{ min: 0, max: 9, step: 0.5 }} placeholder="e.g. 6.5"
              InputProps={{ startAdornment: <InputAdornment position="start"><IeltsIcon sx={{ fontSize: 18 }} /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Min Budget (USD/yr)" type="number" fullWidth size="small" value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)} inputProps={{ min: 0 }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Max Budget (USD/yr)" type="number" fullWidth size="small" value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)} inputProps={{ min: 0 }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
          </Grid>
        </Grid>

        <Divider />

        {/* Goals */}
        <TextField label="Future Goals & Motivation" multiline rows={3} fullWidth value={futureGoals}
          onChange={(e) => setFutureGoals(e.target.value)}
          placeholder="Describe your study goals, career ambitions, and why you want to study abroad..."
          inputProps={{ maxLength: 500 }} helperText={`${futureGoals.length}/500`}
          InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}><GoalsIcon sx={{ fontSize: 18 }} /></InputAdornment> }} />

        <Divider />

        {/* Privacy */}
        <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2 }}>
          <FormControlLabel
            control={<Switch checked={shareAnon} onChange={(e) => setShareAnon(e.target.checked)} color="primary" />}
            label={<Typography variant="body2" fontWeight={500}>Share anonymously (hide my name)</Typography>}
          />
          {!shareAnon && (
            <TextField label="Display Name" fullWidth size="small" value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Name shown to other students" sx={{ mt: 1.5 }}
              helperText="Leave blank to use your account name" />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={mutation.isLoading}
          startIcon={<ShareIcon />} sx={{ bgcolor: levelColor, '&:hover': { bgcolor: levelColor, filter: 'brightness(0.9)' } }}>
          {mutation.isLoading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Share Profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Profile Detail Dialog ──────────────────────────────────────────────────────

function ProfileDetailDialog({ profile, open, onClose }) {
  const navigate = useNavigate();
  if (!profile) return null;

  const name = getDisplayName(profile);
  const levelColor = LEVEL_COLOR[profile.studyLevel] || '#7C3AED';
  const completion = profileCompletion(profile);

  const gpaLabel = profile.studyLevel === 'Bachelor'
    ? profile.hscGPA != null ? { label: 'HSC GPA', value: `${profile.hscGPA} / 5.0` } : null
    : profile.bachelorCGPA != null ? { label: 'Bachelor CGPA', value: `${profile.bachelorCGPA} / 4.0` } : null;

  const ieltsSubBands = [
    profile.ieltsListening && { label: 'L', val: profile.ieltsListening },
    profile.ieltsReading && { label: 'R', val: profile.ieltsReading },
    profile.ieltsWriting && { label: 'W', val: profile.ieltsWriting },
    profile.ieltsSpeaking && { label: 'S', val: profile.ieltsSpeaking },
  ].filter(Boolean);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      {/* Gradient Header */}
      <Box sx={{ background: `linear-gradient(135deg, ${levelColor}ee, ${levelColor}bb)`, p: 3, position: 'relative', color: 'white' }}>
        <IconButton size="small" onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.8)' }}>
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={profile.shareAnonymously ? undefined : profile.user?.profilePicture}
            sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.25)', fontSize: '1.4rem', fontWeight: 800, border: '3px solid rgba(255,255,255,0.5)' }}
          >
            {getInitials(name)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>{name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip label={profile.studyLevel} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: '0.72rem', height: 22 }} />
              {profile.createdAt && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Joined {timeAgo(profile.createdAt)}</Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Key stats pills */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {gpaLabel && (
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 5, px: 1.5, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScoreIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" fontWeight={700}>{gpaLabel.label}: {gpaLabel.value}</Typography>
            </Box>
          )}
          {profile.hasIELTS && profile.ieltsOverall != null && (
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 5, px: 1.5, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LangIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" fontWeight={700}>IELTS {profile.ieltsOverall}</Typography>
            </Box>
          )}
          {profile.budgetMax > 0 && (
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 5, px: 1.5, py: 0.4, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BudgetIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" fontWeight={700}>${(profile.budgetMin ?? 0).toLocaleString()}–${profile.budgetMax.toLocaleString()}/yr</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Stack spacing={2.5}>

          {/* Countries */}
          {profile.preferredCountries?.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PublicIcon sx={{ fontSize: 16 }} /> Target Countries
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {profile.preferredCountries.map((c) => (
                  <Chip key={c} label={`${FLAGS[c] || ''} ${c}`} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                ))}
              </Box>
            </Box>
          )}

          {/* Subjects */}
          {profile.preferredSubjects?.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SchoolIcon sx={{ fontSize: 16 }} /> Preferred Subjects
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {profile.preferredSubjects.map((s) => (
                  <Chip key={s} label={s} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          {/* Academic Background */}
          {(gpaLabel || profile.bachelorDepartment || profile.bachelorUniversity) && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <UniversityIcon sx={{ fontSize: 16 }} /> Academic Background
              </Typography>
              {gpaLabel && <Typography variant="body2">{gpaLabel.label}: <strong>{gpaLabel.value}</strong></Typography>}
              {profile.bachelorDepartment && <Typography variant="body2" sx={{ mt: 0.5 }}>Department: <strong>{profile.bachelorDepartment}</strong></Typography>}
              {profile.bachelorUniversity && <Typography variant="body2" sx={{ mt: 0.5 }}>University: <strong>{profile.bachelorUniversity}</strong></Typography>}
            </Box>
          )}

          {/* Language Proficiency */}
          {profile.hasIELTS && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LangIcon sx={{ fontSize: 16 }} /> Language Proficiency
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <Chip label={`Overall ${profile.ieltsOverall}`} color="success" size="small" sx={{ fontWeight: 700 }} />
                {ieltsSubBands.map(({ label, val }) => (
                  <Box key={label} sx={{ textAlign: 'center', bgcolor: 'grey.100', borderRadius: 1.5, px: 1.25, py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>{label}</Typography>
                    <Typography variant="body2" fontWeight={700}>{val}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Goals */}
          {profile.futureGoals && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GoalsIcon sx={{ fontSize: 16 }} /> Future Goals
              </Typography>
              <Box sx={{ bgcolor: `${levelColor}08`, borderLeft: `3px solid ${levelColor}`, borderRadius: '0 8px 8px 0', p: 1.5 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {profile.futureGoals}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Completion */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Profile completeness</Typography>
              <Typography variant="caption" fontWeight={700} color={levelColor}>{Math.round((completion / 7) * 100)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={(completion / 7) * 100}
              sx={{ height: 6, borderRadius: 3, bgcolor: `${levelColor}20`, '& .MuiLinearProgress-bar': { bgcolor: levelColor, borderRadius: 3 } }} />
          </Box>

        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
        <Button variant="contained" startIcon={<FinderIcon />} onClick={() => { onClose(); navigate('/university-finder'); }}
          sx={{ bgcolor: levelColor, '&:hover': { bgcolor: levelColor, filter: 'brightness(0.9)' } }}>
          Find Universities Like This
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Profile Card ───────────────────────────────────────────────────────────────

function ProfileCard({ profile, onViewDetails }) {
  const name = getDisplayName(profile);
  const levelColor = LEVEL_COLOR[profile.studyLevel] || '#7C3AED';
  const levelLight = LEVEL_LIGHT[profile.studyLevel] || '#F5F3FF';
  const completion = profileCompletion(profile);
  const completionPct = Math.round((completion / 7) * 100);

  const countries = profile.preferredCountries || [];
  const subjects = profile.preferredSubjects || [];
  const visibleCountries = countries.slice(0, 3);
  const extraCountries = countries.length - 3;
  const visibleSubjects = subjects.slice(0, 2);
  const extraSubjects = subjects.length - 2;

  const gpaText = profile.studyLevel === 'Bachelor'
    ? profile.hscGPA != null ? `GPA ${profile.hscGPA}` : null
    : profile.bachelorCGPA != null ? `CGPA ${profile.bachelorCGPA}` : null;

  const budgetText = profile.budgetMax > 0
    ? `$${Math.round((profile.budgetMin ?? 0) / 1000)}k–$${Math.round(profile.budgetMax / 1000)}k/yr`
    : null;

  const goalsSnippet = profile.futureGoals
    ? profile.futureGoals.slice(0, 90) + (profile.futureGoals.length > 90 ? '…' : '')
    : null;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        borderRadius: 3, border: '1px solid', borderColor: 'divider',
        borderLeft: `4px solid ${levelColor}`,
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.10)', transform: 'translateY(-3px)' },
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

        {/* Header: Avatar + Name + Level */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={profile.shareAnonymously ? undefined : profile.user?.profilePicture}
            sx={{ width: 48, height: 48, bgcolor: getAvatarBg(name, profile.studyLevel), fontSize: '0.95rem', fontWeight: 800, flexShrink: 0 }}
          >
            {getInitials(name)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap title={name}>{name}</Typography>
            <Chip
              label={profile.studyLevel || 'Unknown'}
              size="small"
              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: levelLight, color: levelColor, border: 'none' }}
            />
          </Box>
        </Box>

        {/* Countries */}
        {visibleCountries.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {visibleCountries.map((c) => (
              <Chip key={c} size="small" variant="outlined"
                label={`${FLAGS[c] || '🌍'} ${c}`}
                sx={{ fontSize: '0.7rem', height: 22, borderColor: `${levelColor}40` }} />
            ))}
            {extraCountries > 0 && (
              <Chip label={`+${extraCountries}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
            )}
          </Box>
        )}

        {/* Subjects */}
        {visibleSubjects.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {visibleSubjects.map((s) => (
              <Chip key={s} size="small" label={s} variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22, color: levelColor, borderColor: `${levelColor}60`, bgcolor: `${levelColor}08` }} />
            ))}
            {extraSubjects > 0 && (
              <Chip label={`+${extraSubjects}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
            )}
          </Box>
        )}

        {/* Stats row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
          {gpaText && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: 'grey.100', borderRadius: 5, px: 1, py: 0.3 }}>
              <ScoreIcon sx={{ fontSize: '0.85rem', color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600}>{gpaText}</Typography>
            </Box>
          )}
          {profile.hasIELTS && profile.ieltsOverall != null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: '#D1FAE5', borderRadius: 5, px: 1, py: 0.3 }}>
              <LangIcon sx={{ fontSize: '0.85rem', color: '#059669' }} />
              <Typography variant="caption" fontWeight={700} color="#059669">IELTS {profile.ieltsOverall}</Typography>
            </Box>
          )}
          {budgetText && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: 'grey.100', borderRadius: 5, px: 1, py: 0.3 }}>
              <BudgetIcon sx={{ fontSize: '0.85rem', color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={600}>{budgetText}</Typography>
            </Box>
          )}
        </Box>

        {/* Goals snippet */}
        {goalsSnippet && (
          <Typography variant="body2" color="text.secondary"
            sx={{ fontStyle: 'italic', borderLeft: `3px solid ${levelColor}40`, pl: 1, lineHeight: 1.5, fontSize: '0.8rem' }}>
            {goalsSnippet}
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Footer: completion + time */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Tooltip title={`Profile ${completionPct}% complete (${completion}/7 fields)`} arrow>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LinearProgress variant="determinate" value={completionPct}
                sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: `${levelColor}20`, '& .MuiLinearProgress-bar': { bgcolor: levelColor, borderRadius: 2 } }} />
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: '0.68rem' }}>
                {completionPct}%
              </Typography>
            </Box>
          </Tooltip>
          {profile.createdAt && (
            <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap', fontSize: '0.68rem' }}>
              {timeAgo(profile.createdAt)}
            </Typography>
          )}
        </Box>

        {/* View Details */}
        <Button variant="outlined" size="small" fullWidth onClick={() => onViewDetails(profile)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: `${levelColor}60`, color: levelColor, '&:hover': { bgcolor: `${levelColor}08`, borderColor: levelColor } }}>
          View Full Profile
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function ProfileCardSkeleton() {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', borderLeft: '4px solid', borderLeftColor: 'grey.200', height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1.5 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="65%" height={22} />
            <Skeleton variant="rounded" width={70} height={20} sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          <Skeleton variant="rounded" width={90} height={22} />
          <Skeleton variant="rounded" width={70} height={22} />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
          <Skeleton variant="rounded" width={80} height={22} />
          <Skeleton variant="rounded" width={100} height={22} />
        </Box>
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="75%" sx={{ mb: 1.5 }} />
        <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onShare, hasFilters }) {
  return (
    <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
      <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <PeopleIcon sx={{ fontSize: '2.5rem', color: 'grey.400' }} />
      </Box>
      {hasFilters ? (
        <>
          <Typography variant="h6" fontWeight={600} gutterBottom>No profiles match your filters</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 380, mx: 'auto' }}>
            Try adjusting or clearing your filters to see more student profiles.
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h6" fontWeight={600} gutterBottom>No profiles shared yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            Be the first! Share your academic profile and help other Bangladeshi students see what their peers are planning.
          </Typography>
          <Button variant="contained" size="large" startIcon={<ShareIcon />} onClick={onShare} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Share Your Profile
          </Button>
        </>
      )}
    </Box>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentCommunity() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [levelFilter, setLevelFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const debounceRef = React.useRef(null);
  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedQuery(val); setPage(1); }, 400);
  }, []);

  const queryParams = {
    studyLevel: levelFilter !== 'All' ? levelFilter : undefined,
    country: countryFilter || undefined,
    subject: subjectFilter || undefined,
    sort: sortOrder,
    q: debouncedQuery || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, error } = useQuery(
    ['communityProfiles', levelFilter, countryFilter, subjectFilter, sortOrder, debouncedQuery, page],
    () => studyProfileService.getCommunity(queryParams),
    { keepPreviousData: true, staleTime: 60_000 }
  );

  const { data: statsData } = useQuery(
    'communityStats',
    studyProfileService.getStats,
    { staleTime: 5 * 60_000 }
  );

  const { data: myProfileData } = useQuery(
    'myStudyProfile',
    studyProfileService.getMy,
    { enabled: isAuthenticated, staleTime: 60_000 }
  );

  const myProfile = myProfileData?.data;
  const stats = statsData?.data;
  const profiles = data?.data || [];
  const totalPages = Math.ceil((data?.total || 0) / PAGE_SIZE) || 1;

  const hasActiveFilters = levelFilter !== 'All' || countryFilter || subjectFilter || debouncedQuery;

  const clearFilters = () => {
    setLevelFilter('All');
    setCountryFilter('');
    setSubjectFilter('');
    setSortOrder('newest');
    setSearchQuery('');
    setDebouncedQuery('');
    setPage(1);
  };

  const handleShareClick = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to share your profile.');
      navigate('/login');
      return;
    }
    setShareOpen(true);
  };

  const handleViewDetails = (profile) => {
    setSelectedProfile(profile);
    setDetailOpen(true);
  };

  const handlePageChange = (_, v) => {
    setPage(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FB', pb: 8 }}>

      {/* ── Hero ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
        py: { xs: 6, md: 8 }, px: 2, mb: 5,
        position: 'relative', overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: '-40%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' },
        '&::after': { content: '""', position: 'absolute', bottom: '-35%', left: '-8%', width: 380, height: 380, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' },
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <PeopleIcon sx={{ fontSize: 42, color: 'white' }} />
            <Typography variant="h3" fontWeight={800} color="white" sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' } }}>
              Student Community
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 400, maxWidth: 540, lineHeight: 1.65, fontSize: { xs: '1rem', md: '1.1rem' } }}>
            See how other Bangladeshi students are planning their study-abroad journey. Share yours and connect.
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" startIcon={myProfile?.isPublic ? <EditIcon /> : <ShareIcon />}
              onClick={handleShareClick}
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700, '&:hover': { bgcolor: 'grey.100' } }}>
              {myProfile?.isPublic ? 'Update My Profile' : 'Share Your Profile'}
            </Button>
            <Button variant="outlined" size="large" startIcon={<FinderIcon />}
              onClick={() => navigate('/university-finder')}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              University Finder
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">

        {/* ── Level Filter Tabs ── */}
        <Box sx={{ display: 'flex', gap: 0.75, mb: 2.5, flexWrap: 'wrap' }}>
          {STUDY_LEVELS.map((l) => {
            const active = levelFilter === l;
            const color = l === 'All' ? '#374151' : LEVEL_COLOR[l];
            return (
              <Button key={l} size="small" variant={active ? 'contained' : 'outlined'}
                onClick={() => { setLevelFilter(l); setPage(1); }}
                sx={{
                  borderRadius: 5, textTransform: 'none', fontWeight: active ? 700 : 500,
                  ...(active ? { bgcolor: color, borderColor: color, '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }
                    : { borderColor: `${color}60`, color: color, '&:hover': { bgcolor: `${color}08`, borderColor: color } }),
                }}>
                {l}
                {l !== 'All' && stats?.byLevel?.[l] != null && (
                  <Box component="span" sx={{ ml: 0.75, opacity: 0.75, fontWeight: 400 }}>
                    ({stats.byLevel[l]})
                  </Box>
                )}
              </Button>
            );
          })}
        </Box>

        {/* ── Filter + Search Row ── */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by goals or name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            sx={{ minWidth: 260, bgcolor: 'white', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment>,
              endAdornment: searchQuery
                ? <InputAdornment position="end"><IconButton size="small" onClick={() => handleSearchChange('')}><CloseIcon sx={{ fontSize: 16 }} /></IconButton></InputAdornment>
                : null,
            }}
          />

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Target Country</InputLabel>
            <Select value={countryFilter} label="Target Country"
              onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
              sx={{ bgcolor: 'white', borderRadius: 2 }}>
              <MenuItem value="">All Countries</MenuItem>
              {POPULAR_COUNTRIES.map((c) => <MenuItem key={c} value={c}>{FLAGS[c]} {c}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Subject</InputLabel>
            <Select value={subjectFilter} label="Subject"
              onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
              sx={{ bgcolor: 'white', borderRadius: 2 }}>
              <MenuItem value="">All Subjects</MenuItem>
              {SUBJECTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortOrder} label="Sort By"
              onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}
              sx={{ bgcolor: 'white', borderRadius: 2 }}>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </FormControl>

          {hasActiveFilters && (
            <Button size="small" variant="text" startIcon={<CloseIcon />} onClick={clearFilters}
              sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Clear all
            </Button>
          )}

          <Box sx={{ flex: 1 }} />
          {data?.total != null && !isLoading && (
            <Typography variant="body2" color="text.secondary">
              {data.total} profile{data.total !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* ── Error ── */}
        {isError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error?.message || 'Failed to load profiles. Please try again.'}
          </Alert>
        )}

        {/* ── Grid ── */}
        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}><ProfileCardSkeleton /></Grid>
            ))}
          </Grid>
        ) : profiles.length === 0 ? (
          <EmptyState onShare={handleShareClick} hasFilters={hasActiveFilters} />
        ) : (
          <Grid container spacing={3}>
            {profiles.map((profile) => (
              <Grid item xs={12} sm={6} md={4} key={profile._id || profile.id}>
                <ProfileCard profile={profile} onViewDetails={handleViewDetails} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* ── Pagination ── */}
        {!isLoading && profiles.length > 0 && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination count={totalPages} page={page} onChange={handlePageChange}
              color="primary" shape="rounded" showFirstButton showLastButton />
          </Box>
        )}
      </Container>

      {/* ── Dialogs ── */}
      <ProfileDetailDialog profile={selectedProfile} open={detailOpen} onClose={() => setDetailOpen(false)} />
      <ShareProfileDialog open={shareOpen} onClose={() => setShareOpen(false)} existingProfile={myProfile} />
    </Box>
  );
}
