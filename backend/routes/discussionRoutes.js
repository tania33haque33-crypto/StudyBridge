const express = require('express');
const router = express.Router();
const {
  getDiscussions,
  getDiscussion,
  getCountryStats,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  toggleLike,
  addReply,
  deleteReply,
  toggleReplyLike,
  acceptReply,
  getMyDiscussions,
} = require('../controllers/discussionController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public (optional auth to check liked status later if needed)
router.get('/', optionalAuth, getDiscussions);
router.get('/countries/stats', getCountryStats);
router.get('/my', protect, getMyDiscussions);
router.get('/:id', optionalAuth, getDiscussion);

// Protected
router.post('/', protect, createDiscussion);
router.put('/:id', protect, updateDiscussion);
router.delete('/:id', protect, deleteDiscussion);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/replies', protect, addReply);
router.delete('/:id/replies/:replyId', protect, deleteReply);
router.post('/:id/replies/:replyId/like', protect, toggleReplyLike);
router.patch('/:id/replies/:replyId/accept', protect, acceptReply);

module.exports = router;
