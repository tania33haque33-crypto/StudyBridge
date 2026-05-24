import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Description as DocumentIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import applicationService from '@/services/applicationService';
import { formatDate, daysUntil } from '@/utils/formatters';

const applicationStatuses = [
  'Not Started',
  'In Progress',
  'Submitted',
  'Under Review',
  'Accepted',
  'Rejected',
];

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [documentType, setDocumentType] = useState('');

  const { data, isLoading } = useQuery(['application', id], () =>
    applicationService.getById(id)
  );

  const uploadMutation = useMutation(
    ({ file, type }) => applicationService.uploadDocument(id, file, type),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['application', id]);
        setUploadDialogOpen(false);
        toast.success('Document uploaded successfully');
      },
    }
  );

  const updateStatusMutation = useMutation(
    (status) => applicationService.updateStatus(id, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['application', id]);
        setStatusDialogOpen(false);
        toast.success('Status updated successfully');
      },
    }
  );

  const addNoteMutation = useMutation(
    (content) => applicationService.addNote(id, content),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['application', id]);
        setNoteDialogOpen(false);
        setNewNote('');
        toast.success('Note added successfully');
      },
    }
  );

  const deleteDocumentMutation = useMutation(
    (documentId) => applicationService.deleteDocument(id, documentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['application', id]);
        toast.success('Document deleted');
      },
    }
  );

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleUpload = () => {
    if (acceptedFiles.length === 0 || !documentType) {
      toast.error('Please select a file and document type');
      return;
    }
    uploadMutation.mutate({ file: acceptedFiles[0], type: documentType });
  };

  if (isLoading) return <Typography>Loading...</Typography>;

  const application = data?.data;
  if (!application) return <Typography>Application not found</Typography>;

  const currentStepIndex = applicationStatuses.indexOf(application.status);
  const progressPercentage = ((currentStepIndex + 1) / applicationStatuses.length) * 100;

  return (
    <>
      <Helmet>
        <title>Application Details - StudyBridge</title>
      </Helmet>

      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              {application.universityId?.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {application.programName}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={application.status} color="primary" />
              <Chip label={`${application.intake} ${application.intakeYear}`} variant="outlined" />
            </Stack>
          </Box>
          <Box>
            <Button variant="outlined" onClick={() => navigate('/dashboard/applications')}>
              Back to Applications
            </Button>
          </Box>
        </Box>

        {/* Progress */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Application Progress
              </Typography>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => {
                  setNewStatus(application.status);
                  setStatusDialogOpen(true);
                }}
              >
                Update Status
              </Button>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{ height: 10, borderRadius: 5, mb: 3 }}
            />
            <Stepper activeStep={currentStepIndex} alternativeLabel>
              {applicationStatuses.map((status) => (
                <Step key={status}>
                  <StepLabel>{status}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Documents */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Documents
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload Document
                  </Button>
                </Box>
                <List>
                  {application.documents?.length > 0 ? (
                    application.documents.map((doc) => (
                      <ListItem
                        key={doc._id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => deleteDocumentMutation.mutate(doc._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <DocumentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.name}
                          secondary={
                            <>
                              <Chip label={doc.type} size="small" sx={{ mr: 1 }} />
                              <Chip label={doc.status} size="small" color="success" />
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                {formatDate(doc.uploadedAt)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText
                        primary="No documents uploaded yet"
                        secondary="Upload required documents to proceed with your application"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Notes
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setNoteDialogOpen(true)}
                  >
                    Add Note
                  </Button>
                </Box>
                <List>
                  {application.notes?.length > 0 ? (
                    application.notes.map((note, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={note.content}
                          secondary={formatDate(note.createdAt)}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No notes yet" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Deadline */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Application Deadline
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h4" fontWeight={800} color="error.main" gutterBottom>
                  {formatDate(application.deadline)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {daysUntil(application.deadline)} days remaining
                </Typography>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Timeline
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  {application.timeline?.started && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Started
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(application.timeline.started)}
                      </Typography>
                    </Box>
                  )}
                  {application.timeline?.submitted && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Submitted
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(application.timeline.submitted)}
                      </Typography>
                    </Box>
                  )}
                  {application.timeline?.decision && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Decision
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(application.timeline.decision)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                label="Document Type"
              >
                <MenuItem value="Transcript">Transcript</MenuItem>
                <MenuItem value="SOP">Statement of Purpose</MenuItem>
                <MenuItem value="LOR">Letter of Recommendation</MenuItem>
                <MenuItem value="Resume">Resume/CV</MenuItem>
                <MenuItem value="Test Score">Test Score</MenuItem>
                <MenuItem value="Passport">Passport</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" gutterBottom>
                Drag & drop file here or click to browse
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </Typography>
            </Box>
            {acceptedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Chip label={acceptedFiles[0].name} onDelete={() => {}} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} variant="contained" disabled={uploadMutation.isLoading}>
              {uploadMutation.isLoading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status">
                {applicationStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => updateStatusMutation.mutate(newStatus)} variant="contained">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Note Dialog */}
        <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Note</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => addNoteMutation.mutate(newNote)} variant="contained">
              Add Note
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ApplicationDetail;