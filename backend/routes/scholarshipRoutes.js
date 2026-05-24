const express = require('express');
const router = express.Router();
const {
  getAllScholarships,
  getScholarshipById,
  searchScholarships,
  getFilterOptions,
  getUpcomingDeadlines,
  getRecommendedScholarships,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  toggleScholarshipStatus,
  saveScholarship,
  unsaveScholarship,
  getSavedScholarships
} = require('../controllers/scholarshipController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', optionalAuth, getAllScholarships);
router.get('/search', searchLimiter, searchScholarships);
router.get('/filter-options', getFilterOptions);
router.get('/upcoming-deadlines', getUpcomingDeadlines);
router.get('/:id', getScholarshipById);

// Protected student routes
router.use(protect);
router.get('/user/recommended', getRecommendedScholarships);
router.get('/user/saved', getSavedScholarships);
router.post('/:id/save', saveScholarship);
router.delete('/:id/save', unsaveScholarship);

// Admin routes
router.post('/', authorize('admin', 'moderator'), createScholarship);
router.put('/:id', authorize('admin', 'moderator'), updateScholarship);
router.delete('/:id', authorize('admin'), deleteScholarship);
router.patch('/:id/toggle-status', authorize('admin', 'moderator'), toggleScholarshipStatus);

module.exports = router;