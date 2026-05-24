const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByUniversity,
  getReviewById,
  updateReview,
  deleteReview,
  markHelpful,
  reportReview,
  getPendingReviews,
  approveReview,
  rejectReview,
  getMyReviews,
  uploadReviewPhotos
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

// Public routes
router.get('/university/:universityId', getReviewsByUniversity);
router.get('/:id', getReviewById);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.get('/user/my-reviews', getMyReviews);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', markHelpful);
router.post('/:id/report', reportReview);
router.post('/:id/photos', uploadMultiple('photos', 5), uploadReviewPhotos);

// Admin/Moderator routes
router.get('/admin/pending', authorize('admin', 'moderator'), getPendingReviews);
router.patch('/:id/approve', authorize('admin', 'moderator'), approveReview);
router.patch('/:id/reject', authorize('admin', 'moderator'), rejectReview);

module.exports = router;