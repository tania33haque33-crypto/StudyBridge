import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  InputAdornment,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as VerifyIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import universityService from '@/services/universityService';

const UniversityManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useQuery(
    ['adminUniversities', searchQuery, page, rowsPerPage],
    () => universityService.search({ q: searchQuery || undefined, page: page + 1, limit: rowsPerPage }),
    { keepPreviousData: true }
  );

  const universities = data?.data || [];
  const total = data?.total || 0;

  const invalidate = () => queryClient.invalidateQueries('adminUniversities');

  const deleteMutation = useMutation(
    (id) => universityService.delete(id),
    {
      onSuccess: () => { toast.success('University deleted'); setDeleteDialogOpen(false); invalidate(); },
      onError: () => toast.error('Failed to delete university'),
    }
  );

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  const handleCSVUpload = async () => {
    if (acceptedFiles.length === 0) { toast.error('Please select a CSV file'); return; }
    setUploading(true);
    try {
      await universityService.importCSV(acceptedFiles[0]);
      toast.success('Universities imported successfully');
      setUploadDialogOpen(false);
      invalidate();
    } catch {
      toast.error('Failed to import universities');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>University Management - Admin</title>
      </Helmet>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              University Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {total} universities in database
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setUploadDialogOpen(true)}>
              Import CSV
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/universities')}>
              Add University
            </Button>
          </Stack>
        </Box>

        {/* Search */}
        <Card sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search universities..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Card>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>University</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>QS Rank</TableCell>
                  <TableCell>Programs</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <TableCell key={j}><Skeleton variant="text" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : universities.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                          <SchoolIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
                          <Typography color="text.secondary">No universities found</Typography>
                        </TableCell>
                      </TableRow>
                    )
                  : universities.map((uni) => (
                      <TableRow key={uni._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={uni.logo} variant="rounded" sx={{ width: 36, height: 36 }}>
                              {uni.name?.[0]}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {uni.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{uni.city}, {uni.country}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={uni.universityType} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {uni.rankings?.qsRanking?.world ? (
                            <Chip label={`#${uni.rankings.qsRanking.world}`} size="small" color="primary" />
                          ) : '—'}
                        </TableCell>
                        <TableCell>{uni.programs?.length || 0}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {uni.isVerified && <Chip label="Verified" size="small" color="success" />}
                            {uni.isFeatured && <Chip label="Featured" size="small" color="secondary" />}
                            {!uni.isActive && <Chip label="Inactive" size="small" color="error" />}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/universities/${uni.slug}`)}
                              title="View"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => { setSelectedUni(uni); setDeleteDialogOpen(true); }}
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Card>

        {/* CSV Upload Dialog */}
        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Import Universities from CSV</DialogTitle>
          <DialogContent>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                mt: 2,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Drag & drop CSV file here</Typography>
              <Typography variant="body2" color="text.secondary">or click to browse</Typography>
            </Box>
            {acceptedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Selected file:</Typography>
                <Chip label={acceptedFiles[0].name} sx={{ mt: 1 }} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCSVUpload} variant="contained" disabled={uploading || acceptedFiles.length === 0}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete University</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{selectedUni?.name}</strong>? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => deleteMutation.mutate(selectedUni._id)}
              variant="contained"
              color="error"
              disabled={deleteMutation.isLoading}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default UniversityManagement;
