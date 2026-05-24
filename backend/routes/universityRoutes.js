const express = require('express');
const router = express.Router();
const {
  getAllUniversities,
  getUniversityById,
  getUniversityBySlug,
  searchUniversities,
  getFilterOptions,
  compareUniversities,
  getSimilarUniversities,
  getPopularUniversities,
  getFeaturedUniversities,
  incrementViewCount,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  verifyUniversity,
  uploadUniversityImages,
  importFromCSV,
  exportToCSV
} = require('../controllers/universityController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadMultiple, uploadSingle } = require('../middleware/upload');
const { searchLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', optionalAuth, getAllUniversities);
router.get('/search', searchLimiter, optionalAuth, searchUniversities);
router.get('/filter-options', getFilterOptions);
router.get('/popular', getPopularUniversities);
router.get('/featured', getFeaturedUniversities);
router.post('/compare', compareUniversities);
router.get('/:id/similar', getSimilarUniversities);
router.get('/slug/:slug', optionalAuth, getUniversityBySlug);
router.get('/:id', optionalAuth, getUniversityById);
router.post('/:id/view', incrementViewCount);

// Admin routes
router.use(protect);
router.use(authorize('admin', 'moderator'));
router.post('/', createUniversity);
router.put('/:id', updateUniversity);
router.delete('/:id', deleteUniversity);
router.patch('/:id/verify', verifyUniversity);
router.post('/:id/images', uploadMultiple('images', 10), uploadUniversityImages);
router.post('/import/csv', uploadSingle('csv'), importFromCSV);
router.get('/export/csv', exportToCSV);

module.exports = router;