const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  saveUniversity,
  unsaveUniversity,
  getSavedUniversities,
  saveSearch,
  getSavedSearches,
  deleteSearch,
  updatePreferences,
  deleteAccount,
  getRecommendations
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.use(protect);

// Profile management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/picture', uploadSingle('profilePicture'), uploadProfilePicture);
router.delete('/profile/picture', deleteProfilePicture);

// Saved universities
router.get('/saved-universities', getSavedUniversities);
router.post('/saved-universities/:universityId', saveUniversity);
router.delete('/saved-universities/:universityId', unsaveUniversity);

// Saved searches
router.get('/saved-searches', getSavedSearches);
router.post('/saved-searches', saveSearch);
router.delete('/saved-searches/:searchId', deleteSearch);

// Preferences and recommendations
router.put('/preferences', updatePreferences);
router.get('/recommendations', getRecommendations);

// Account deletion
router.delete('/account', deleteAccount);

module.exports = router;