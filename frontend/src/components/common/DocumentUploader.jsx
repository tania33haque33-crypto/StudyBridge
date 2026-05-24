import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const DocumentUploader = ({
  onUpload,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  existingFiles = [],
  onDelete,
}) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: acceptedFormats,
    maxFiles,
    maxSize,
    onDrop: async (acceptedFiles) => {
      setErrors([]);
      
      for (const file of acceptedFiles) {
        try {
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              const currentProgress = prev[file.name] || 0;
              if (currentProgress >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return { ...prev, [file.name]: currentProgress + 10 };
            });
          }, 200);

          await onUpload(file);

          clearInterval(progressInterval);
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

          // Clear progress after 2 seconds
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          }, 2000);
        } catch (error) {
          setErrors((prev) => [...prev, `Failed to upload ${file.name}`]);
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }
      }
    },
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Drop Zone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          or
        </Typography>
        <Button variant="outlined" sx={{ mt: 1 }}>
          Browse Files
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
          Accepted formats: PDF, DOC, DOCX (Max {formatFileSize(maxSize)})
        </Typography>
      </Paper>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {fileRejections.map(({ file, errors }) => (
            <Typography key={file.name} variant="body2">
              {file.name}: {errors.map((e) => e.message).join(', ')}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setErrors([])}>
          {errors.map((error, index) => (
            <Typography key={index} variant="body2">
              {error}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mt: 2 }}>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <Box key={fileName} sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Uploading {fileName}...
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Uploaded Documents
          </Typography>
          <List>
            {existingFiles.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  mb: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary={file.name}
                  secondary={
                    <>
                      {file.size && formatFileSize(file.size)} • {file.type}
                      {file.uploadedAt && ` • Uploaded ${new Date(file.uploadedAt).toLocaleDateString()}`}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  {file.status === 'Verified' && <CheckIcon color="success" sx={{ mr: 1 }} />}
                  {file.status === 'Rejected' && <ErrorIcon color="error" sx={{ mr: 1 }} />}
                  <IconButton
                    edge="end"
                    onClick={() => onDelete(file.id || file._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Upload Limit Info */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        You can upload up to {maxFiles} files. Total size per file: {formatFileSize(maxSize)}
      </Typography>
    </Box>
  );
};

export default DocumentUploader;