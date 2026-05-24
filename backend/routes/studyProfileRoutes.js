const express = require('express');
const router = express.Router();
const {
  matchUniversities,
  saveProfile,
  getMyProfile,
  getCommunityProfiles,
  getCommunityStats,
} = require('../controllers/studyProfileController');
const { protect } = require('../middleware/auth');

router.post('/match', matchUniversities);
router.get('/community/stats', getCommunityStats);
router.get('/community', getCommunityProfiles);
router.get('/my', protect, getMyProfile);
router.post('/', protect, saveProfile);

module.exports = router;
