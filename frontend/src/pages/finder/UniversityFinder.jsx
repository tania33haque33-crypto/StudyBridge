import { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  Paper,
} from '@mui/material';
import {
  School as SchoolIcon,
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Public as PublicIcon,
  AttachMoney as MoneyIcon,
  EmojiEvents as TrophyIcon,
  Bookmark as BookmarkIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import studyProfileService from '@/services/studyProfileService';
import useAuthStore from '@/store/authStore';
import SafeImage from '@/components/common/SafeImage';

const STEPS = [
  'Academic Background',
  'English Proficiency',
  'Study Preferences',
  'Goals & Sharing',
];

const COUNTRIES = [
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany',
  'Netherlands', 'Sweden', 'Denmark', 'Finland', 'Norway',
  'Malaysia', 'Japan', 'South Korea', 'China', 'Turkey',
  'New Zealand', 'Singapore', 'Ireland', 'Hungary', 'Czech Republic',
];

const SUBJECTS = [
  'Computer Science', 'Software Engineering', 'Data Science & AI',
  'Business Administration', 'Electrical Engineering', 'Civil Engineering',
  'Mechanical Engineering', 'Medicine & Health', 'Pharmacy', 'Architecture',
  'Environmental Science', 'Economics & Finance', 'Mathematics', 'Physics',
  'Chemistry', 'Law', 'Education', 'Social Sciences', 'Media & Communication',
  'Biotechnology', 'Agriculture', 'Textile Engineering',
];

const SSC_HSC_GROUPS = ['Science', 'Commerce', 'Arts', 'Other'];
const GPA_SCALES = ['4.0', '5.0'];
const TARGET_YEARS = [2025, 2026, 2027, 2028];

function getMatchColor(score) {
  if (score >= 70) return 'success.main';
  if (score >= 50) return 'warning.main';
  return 'error.main';
}

function getMatchBarColor(score) {
  if (score >= 70) return 'success';
  if (score >= 50) return 'warning';
  return 'error';
}

function formatTuition(amount) {
  if (!amount && amount !== 0) return 'Contact for fees';
  return `$${Number(amount).toLocaleString()}/yr`;
}

// ---------------------------------------------------------------------------
// Step 1: Academic Background
// ---------------------------------------------------------------------------
function StepAcademicBackground({ profile, onChange }) {
  const showSSCHSC = profile.studyLevel === 'Bachelor' || profile.studyLevel === 'Master' || profile.studyLevel === 'PhD';
  const showBachelor = profile.studyLevel === 'Master' || profile.studyLevel === 'PhD';

  const handleLevel = (_, val) => {
    if (val) onChange('studyLevel', val);
  };

  const handleMedium = (_, val) => {
    if (val) onChange('mediumOfStudy', val);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Study Level */}
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
          Study Level *
        </Typography>
        <ToggleButtonGroup
          value={profile.studyLevel}
          exclusive
          onChange={handleLevel}
          fullWidth
          sx={{ '& .MuiToggleButton-root': { py: 1.5, fontWeight: 600 } }}
        >
          <ToggleButton value="Bachelor">Bachelor</ToggleButton>
          <ToggleButton value="Master">Master</ToggleButton>
          <ToggleButton value="PhD">PhD</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* SSC Row */}
      {showSSCHSC && (
        <>
          <Divider />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            SSC (Secondary School Certificate)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="SSC GPA"
                type="number"
                fullWidth
                value={profile.sscGPA}
                onChange={(e) => onChange('sscGPA', e.target.value)}
                inputProps={{ min: 0, max: 5, step: 0.01 }}
                size="small"
                placeholder="e.g. 5.00"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>SSC Group</InputLabel>
                <Select
                  value={profile.sscGroup}
                  label="SSC Group"
                  onChange={(e) => onChange('sscGroup', e.target.value)}
                >
                  {SSC_HSC_GROUPS.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="SSC Year"
                type="number"
                fullWidth
                value={profile.sscYear}
                onChange={(e) => onChange('sscYear', e.target.value)}
                inputProps={{ min: 1990, max: 2030 }}
                size="small"
                placeholder="e.g. 2018"
              />
            </Grid>
          </Grid>

          {/* HSC Row */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            HSC (Higher Secondary Certificate)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="HSC GPA"
                type="number"
                fullWidth
                value={profile.hscGPA}
                onChange={(e) => onChange('hscGPA', e.target.value)}
                inputProps={{ min: 0, max: 5, step: 0.01 }}
                size="small"
                placeholder="e.g. 4.83"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>HSC Group</InputLabel>
                <Select
                  value={profile.hscGroup}
                  label="HSC Group"
                  onChange={(e) => onChange('hscGroup', e.target.value)}
                >
                  {SSC_HSC_GROUPS.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="HSC Year"
                type="number"
                fullWidth
                value={profile.hscYear}
                onChange={(e) => onChange('hscYear', e.target.value)}
                inputProps={{ min: 1990, max: 2030 }}
                size="small"
                placeholder="e.g. 2020"
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Bachelor (for Master / PhD) */}
      {showBachelor && (
        <>
          <Divider />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Bachelor's Degree
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Bachelor CGPA"
                type="number"
                fullWidth
                value={profile.bachelorCGPA}
                onChange={(e) => onChange('bachelorCGPA', e.target.value)}
                inputProps={{ min: 0, max: 5, step: 0.01 }}
                size="small"
                placeholder="e.g. 3.75"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>GPA Scale</InputLabel>
                <Select
                  value={profile.bachelorScale}
                  label="GPA Scale"
                  onChange={(e) => onChange('bachelorScale', e.target.value)}
                >
                  {GPA_SCALES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Department / Major"
                fullWidth
                value={profile.bachelorDepartment}
                onChange={(e) => onChange('bachelorDepartment', e.target.value)}
                size="small"
                placeholder="e.g. Computer Science"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="University"
                fullWidth
                value={profile.bachelorUniversity}
                onChange={(e) => onChange('bachelorUniversity', e.target.value)}
                size="small"
                placeholder="e.g. BUET"
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Medium of Study */}
      <Divider />
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
          Medium of Study
        </Typography>
        <ToggleButtonGroup
          value={profile.mediumOfStudy}
          exclusive
          onChange={handleMedium}
          fullWidth
          sx={{ '& .MuiToggleButton-root': { py: 1.5, fontWeight: 500 } }}
        >
          <ToggleButton value="English">English</ToggleButton>
          <ToggleButton value="Bengali">Bengali</ToggleButton>
          <ToggleButton value="Mixed">Mixed</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Step 2: English Proficiency
// ---------------------------------------------------------------------------
function StepEnglishProficiency({ profile, onChange }) {
  const hasNeither = !profile.hasIELTS && !profile.hasTOEFL;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* IELTS */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={profile.hasIELTS}
              onChange={(e) => onChange('hasIELTS', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              I have an IELTS score
            </Typography>
          }
        />
        {profile.hasIELTS && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Overall Band Score"
              type="number"
              value={profile.ieltsOverall}
              onChange={(e) => onChange('ieltsOverall', e.target.value)}
              inputProps={{ min: 4.0, max: 9.0, step: 0.5 }}
              size="small"
              sx={{ mb: 2, width: 220 }}
              placeholder="e.g. 6.5"
            />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Band Scores
            </Typography>
            <Grid container spacing={2}>
              {['Listening', 'Reading', 'Writing', 'Speaking'].map((band) => {
                const key = `ielts${band}`;
                return (
                  <Grid item xs={6} sm={3} key={band}>
                    <TextField
                      label={band}
                      type="number"
                      fullWidth
                      value={profile[key]}
                      onChange={(e) => onChange(key, e.target.value)}
                      inputProps={{ min: 0, max: 9, step: 0.5 }}
                      size="small"
                      placeholder="0–9"
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* TOEFL */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={profile.hasTOEFL}
              onChange={(e) => onChange('hasTOEFL', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              I have a TOEFL score
            </Typography>
          }
        />
        {profile.hasTOEFL && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="TOEFL Score"
              type="number"
              value={profile.toeflScore}
              onChange={(e) => onChange('toeflScore', e.target.value)}
              inputProps={{ min: 0, max: 120 }}
              size="small"
              sx={{ width: 220 }}
              placeholder="0–120"
            />
          </Box>
        )}
      </Paper>

      {/* Neither alert */}
      {hasNeither && (
        <Alert
          icon={<CheckIcon fontSize="inherit" />}
          severity="info"
          sx={{ borderRadius: 2 }}
        >
          Universities still consider your academic background. You can still find matches!
        </Alert>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Study Preferences
// ---------------------------------------------------------------------------
function StepStudyPreferences({ profile, onChange }) {
  const toggleChip = (field, value) => {
    const current = profile[field];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange(field, updated);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Preferred Countries */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PublicIcon fontSize="small" color="primary" />
          Preferred Countries
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {COUNTRIES.map((country) => {
            const selected = profile.preferredCountries.includes(country);
            return (
              <Chip
                key={country}
                label={country}
                onClick={() => toggleChip('preferredCountries', country)}
                variant={selected ? 'filled' : 'outlined'}
                color={selected ? 'primary' : 'default'}
                sx={{
                  cursor: 'pointer',
                  fontWeight: selected ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              />
            );
          })}
        </Box>
      </Box>

      <Divider />

      {/* Preferred Subjects */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon fontSize="small" color="primary" />
          Preferred Subjects
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {SUBJECTS.map((subject) => {
            const selected = profile.preferredSubjects.includes(subject);
            return (
              <Chip
                key={subject}
                label={subject}
                onClick={() => toggleChip('preferredSubjects', subject)}
                variant={selected ? 'filled' : 'outlined'}
                color={selected ? 'secondary' : 'default'}
                sx={{
                  cursor: 'pointer',
                  fontWeight: selected ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              />
            );
          })}
        </Box>
      </Box>

      <Divider />

      {/* Budget */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoneyIcon fontSize="small" color="primary" />
          Annual Budget (USD)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Min Budget"
              type="number"
              fullWidth
              value={profile.budgetMin}
              onChange={(e) => onChange('budgetMin', e.target.value)}
              inputProps={{ min: 0 }}
              size="small"
              InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>$</Typography> }}
              placeholder="5000"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Max Budget"
              type="number"
              fullWidth
              value={profile.budgetMax}
              onChange={(e) => onChange('budgetMax', e.target.value)}
              inputProps={{ min: 0 }}
              size="small"
              InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>$</Typography> }}
              placeholder="25000"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* Target Year */}
      <Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Target Intake Year</InputLabel>
          <Select
            value={profile.targetYear}
            label="Target Intake Year"
            onChange={(e) => onChange('targetYear', e.target.value)}
          >
            {TARGET_YEARS.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Step 4: Goals & Sharing
// ---------------------------------------------------------------------------
function StepGoalsSharing({ profile, onChange, isAuthenticated }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Future Goals
        </Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          value={profile.futureGoals}
          onChange={(e) => onChange('futureGoals', e.target.value)}
          placeholder="Describe your study goals, career aspirations..."
          variant="outlined"
        />
      </Box>

      {isAuthenticated && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Community Sharing
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sharing helps other students learn from your experience.
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={profile.isPublic}
                  onChange={(e) => onChange('isPublic', e.target.checked)}
                  color="primary"
                />
              }
              label="Share my profile with the community"
            />

            {profile.isPublic && (
              <Box sx={{ mt: 2, pl: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.shareAnonymously}
                      onChange={(e) => onChange('shareAnonymously', e.target.checked)}
                      color="secondary"
                    />
                  }
                  label="Share anonymously"
                />
                {!profile.shareAnonymously && (
                  <TextField
                    label="Display Name"
                    value={profile.displayName}
                    onChange={(e) => onChange('displayName', e.target.value)}
                    size="small"
                    sx={{ maxWidth: 320 }}
                    placeholder="Your public display name"
                  />
                )}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Result Card
// ---------------------------------------------------------------------------
function ResultCard({ university, navigate }) {
  const score = university.matchPercentage ?? university.score ?? 0;
  const matchReasons = (university.matchReasons || []).slice(0, 3);
  const warnings = university.warnings || [];
  const qsRank = university.rankings?.qsRanking?.world;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 6 },
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        {/* Logo + Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <SafeImage
            src={university.logo}
            alt={university.name}
            seed={university.name}
            width={60}
            height={60}
            sx={{ borderRadius: 2, objectFit: 'contain', border: '1px solid', borderColor: 'divider', p: 0.5 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
            >
              {university.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <PublicIcon sx={{ fontSize: 14 }} />
              {[university.city, university.country].filter(Boolean).join(', ')}
            </Typography>
          </Box>
        </Box>

        {/* Match percentage */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Match Score
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: getMatchColor(score) }}>
              {score}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(score, 100)}
            color={getMatchBarColor(score)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Match Reasons */}
        {matchReasons.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
            {matchReasons.map((reason, idx) => (
              <Chip
                key={idx}
                label={reason}
                size="small"
                icon={<CheckIcon sx={{ fontSize: '14px !important' }} />}
                color="success"
                variant="outlined"
                sx={{ fontSize: '0.72rem', height: 24 }}
              />
            ))}
          </Box>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <Alert
            severity="warning"
            icon={<WarningIcon fontSize="inherit" />}
            sx={{ py: 0.5, mb: 1.5, '& .MuiAlert-message': { fontSize: '0.78rem' } }}
          >
            {warnings[0]}
          </Alert>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Tuition + Rank */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatTuition(university.effectiveTuition)}
            </Typography>
          </Box>
          {qsRank && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrophyIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                QS #{qsRank}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/universities/${university.slug || university._id}`)}
          sx={{ flex: 1, fontWeight: 600 }}
        >
          View Details
        </Button>
        <Button
          variant="outlined"
          size="small"
          endIcon={<OpenInNewIcon />}
          onClick={() => window.open(university.applicationLink || university.website, '_blank')}
          disabled={!university.applicationLink && !university.website}
          sx={{ flex: 1, fontWeight: 600 }}
        >
          Apply Now
        </Button>
      </CardActions>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const UniversityFinder = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [activeStep, setActiveStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [sortMode, setSortMode] = useState('match'); // match | tuition | rank
  const [stepError, setStepError] = useState('');

  const [profile, setProfile] = useState({
    studyLevel: 'Master',
    sscGPA: '', sscGroup: 'Science', sscYear: '',
    hscGPA: '', hscGroup: 'Science', hscYear: '',
    bachelorCGPA: '', bachelorScale: '4.0', bachelorDepartment: '', bachelorUniversity: '',
    mediumOfStudy: 'Mixed',
    hasIELTS: false,
    ieltsOverall: '', ieltsListening: '', ieltsReading: '', ieltsWriting: '', ieltsSpeaking: '',
    hasTOEFL: false, toeflScore: '',
    preferredSubjects: [], preferredCountries: [],
    budgetMin: 5000, budgetMax: 25000,
    targetYear: 2026,
    futureGoals: '',
    isPublic: false, shareAnonymously: false, displayName: '',
  });

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Match mutation — flatten nested { university, score, matchReasons, ... } structure
  const matchMutation = useMutation(studyProfileService.match, {
    onSuccess: (data) => {
      const flattened = (data.data || []).map((r) => ({
        ...r.university,
        matchPercentage: r.matchPercentage,
        score: r.score,
        matchReasons: r.matchReasons || [],
        warnings: r.warnings || [],
        effectiveTuition: r.effectiveTuition,
      }));
      setResults(flattened);
      setShowResults(true);
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
  });

  // Save profile mutation
  const saveMutation = useMutation(studyProfileService.save);

  const buildPayload = () => ({
    ...profile,
    sscGPA: parseFloat(profile.sscGPA) || undefined,
    hscGPA: parseFloat(profile.hscGPA) || undefined,
    bachelorCGPA: parseFloat(profile.bachelorCGPA) || undefined,
    ieltsOverall: parseFloat(profile.ieltsOverall) || undefined,
    ieltsListening: parseFloat(profile.ieltsListening) || undefined,
    ieltsReading: parseFloat(profile.ieltsReading) || undefined,
    ieltsWriting: parseFloat(profile.ieltsWriting) || undefined,
    ieltsSpeaking: parseFloat(profile.ieltsSpeaking) || undefined,
    toeflScore: parseFloat(profile.toeflScore) || undefined,
    budgetMin: parseInt(profile.budgetMin) || 0,
    budgetMax: parseInt(profile.budgetMax) || 50000,
  });

  const handleFindUniversities = () => {
    const payload = buildPayload();
    matchMutation.mutate(payload);
    if (isAuthenticated && profile.isPublic) {
      saveMutation.mutate(profile);
    }
  };

  const handleSaveProfile = () => {
    saveMutation.mutate(profile);
  };

  const validateStep = () => {
    if (activeStep === 0 && !profile.studyLevel) {
      setStepError('Please select a study level to continue.');
      return false;
    }
    setStepError('');
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setStepError('');
    setActiveStep((s) => s - 1);
  };

  // Sorted results
  const sortedResults = [...results].sort((a, b) => {
    if (sortMode === 'match') {
      return (b.matchPercentage ?? b.score ?? 0) - (a.matchPercentage ?? a.score ?? 0);
    }
    if (sortMode === 'tuition') {
      return (a.effectiveTuition ?? Infinity) - (b.effectiveTuition ?? Infinity);
    }
    if (sortMode === 'rank') {
      return (a.rankings?.qsRanking?.world ?? Infinity) - (b.rankings?.qsRanking?.world ?? Infinity);
    }
    return 0;
  });

  const stepContent = [
    <StepAcademicBackground key="step1" profile={profile} onChange={handleChange} />,
    <StepEnglishProficiency key="step2" profile={profile} onChange={handleChange} />,
    <StepStudyPreferences key="step3" profile={profile} onChange={handleChange} />,
    <StepGoalsSharing key="step4" profile={profile} onChange={handleChange} isAuthenticated={isAuthenticated} />,
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <SearchIcon sx={{ fontSize: { xs: 48, md: 64 }, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '2.75rem' } }}>
            University Finder
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2, fontWeight: 400, fontSize: { xs: '1rem', md: '1.2rem' } }}>
            Enter your academic profile and get personalized university recommendations
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75, letterSpacing: 0.5 }}>
            Tailored for Bangladeshi students &bull; 90+ universities &bull; Instant results
          </Typography>
        </Container>
      </Box>

      {/* Wizard Section */}
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Card */}
        <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
            {STEPS[activeStep]}
          </Typography>

          {stepContent[activeStep]}

          {/* Step Error */}
          {stepError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {stepError}
            </Alert>
          )}

          {/* Match API Error */}
          {matchMutation.isError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {matchMutation.error?.response?.data?.message || 'Failed to fetch university matches. Please try again.'}
            </Alert>
          )}

          {/* Save Error/Success */}
          {saveMutation.isError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {saveMutation.error?.response?.data?.message || 'Failed to save profile.'}
            </Alert>
          )}
          {saveMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
              Profile saved successfully!
            </Alert>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, gap: 2, flexWrap: 'wrap' }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              sx={{ minWidth: 110 }}
            >
              Back
            </Button>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {activeStep === STEPS.length - 1 ? (
                <>
                  {isAuthenticated && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<BookmarkIcon />}
                      onClick={handleSaveProfile}
                      disabled={saveMutation.isLoading}
                      sx={{ minWidth: 140 }}
                    >
                      {saveMutation.isLoading ? <CircularProgress size={18} /> : 'Save Profile'}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    endIcon={matchMutation.isLoading ? null : <SearchIcon />}
                    onClick={handleFindUniversities}
                    disabled={matchMutation.isLoading}
                    sx={{ minWidth: 200, fontWeight: 700 }}
                  >
                    {matchMutation.isLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={18} color="inherit" />
                        Finding...
                      </Box>
                    ) : (
                      'Find My Universities'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ minWidth: 110, fontWeight: 600 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Results Section */}
      {showResults && (
        <Box
          id="results-section"
          sx={{ bgcolor: 'grey.50', py: { xs: 5, md: 7 }, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Container maxWidth="lg">
            {/* Results Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  We found {results.length} {results.length === 1 ? 'university' : 'universities'} matching your profile
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Results are sorted by best match by default
                </Typography>
              </Box>

              {/* Sort Buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                <Button
                  size="small"
                  variant={sortMode === 'match' ? 'contained' : 'outlined'}
                  onClick={() => setSortMode('match')}
                  sx={{ fontWeight: 600 }}
                >
                  Best Match
                </Button>
                <Button
                  size="small"
                  variant={sortMode === 'tuition' ? 'contained' : 'outlined'}
                  startIcon={<MoneyIcon />}
                  onClick={() => setSortMode('tuition')}
                  sx={{ fontWeight: 600 }}
                >
                  Lowest Tuition
                </Button>
                <Button
                  size="small"
                  variant={sortMode === 'rank' ? 'contained' : 'outlined'}
                  startIcon={<TrophyIcon />}
                  onClick={() => setSortMode('rank')}
                  sx={{ fontWeight: 600 }}
                >
                  Highest Ranked
                </Button>
              </Box>
            </Box>

            {results.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <SchoolIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No universities found for your profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your budget range, preferred countries, or academic requirements.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {sortedResults.map((university, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={university._id || idx}>
                    <ResultCard university={university} navigate={navigate} />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Re-search CTA */}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Not satisfied with the results?
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  setShowResults(false);
                  setActiveStep(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                sx={{ fontWeight: 600 }}
              >
                Refine My Profile
              </Button>
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default UniversityFinder;
