const express = require('express');
const router = express.Router();
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
  uploadDocument,
  deleteDocument,
  addNote,
  getApplicationTimeline,
  checkEligibility,
  generateDocumentChecklist,
  getApplicationStats,
  getUpcomingDeadlines,
  autoAddApplications
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.use(protect);

// Application CRUD
router.post('/', createApplication);
router.get('/', getAllApplications);
router.get('/stats', getApplicationStats);
router.get('/upcoming-deadlines', getUpcomingDeadlines);
router.post('/auto-add', autoAddApplications);
router.get('/:id', getApplicationById);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);
router.patch('/:id/status', updateApplicationStatus);

// Documents
router.post('/:id/documents', uploadSingle('document'), uploadDocument);
router.delete('/:id/documents/:documentId', deleteDocument);

// Notes and timeline
router.post('/:id/notes', addNote);
router.get('/:id/timeline', getApplicationTimeline);

// Utilities
router.post('/check-eligibility', checkEligibility);
router.post('/document-checklist', generateDocumentChecklist);

module.exports = router;