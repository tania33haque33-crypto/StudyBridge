const User = require('../models/User');
const dbOps = require('../utils/databaseOperations');
const { deleteFile } = require('../utils/helpers');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'dateOfBirth',
      'nationality',
      'currentCountry',
      'educationLevel',
      'studyLevel',
      'preferredCountries',
      'preferredCourses',
      'budget',
      'englishProficiency',
      'standardizedTests',
      'workExperience',
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await dbOps.updateUser(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile/picture
// @access  Private
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const user = await dbOps.findUserById(req.user.id);

    // Delete old profile picture
    if (user.profilePicture) {
      await deleteFile(user.profilePicture);
    }

    const updatedUser = await dbOps.updateUser(req.user.id, {
      profilePicture: `/uploads/profiles/${req.file.filename}`
    }, {
      new: true
    });

    res.status(200).json({
      success: true,
      data: { profilePicture: updatedUser.profilePicture },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/users/profile/picture
// @access  Private
exports.deleteProfilePicture = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id);

    if (user.profilePicture) {
      await deleteFile(user.profilePicture);
      await dbOps.updateUser(req.user.id, { profilePicture: null });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save university
// @route   POST /api/users/saved-universities/:universityId
// @access  Private
exports.saveUniversity = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id);

    if (user.savedUniversities.includes(req.params.universityId)) {
      return res.status(400).json({
        success: false,
        message: 'University already saved',
      });
    }

    await dbOps.updateUser(req.user.id, {
      $push: { savedUniversities: req.params.universityId }
    });

    res.status(200).json({
      success: true,
      message: 'University saved',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave university
// @route   DELETE /api/users/saved-universities/:universityId
// @access  Private
exports.unsaveUniversity = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id);

    await dbOps.updateUser(req.user.id, {
      $pull: { savedUniversities: req.params.universityId }
    });

    res.status(200).json({
      success: true,
      message: 'University removed from saved list',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved universities
// @route   GET /api/users/saved-universities
// @access  Private
exports.getSavedUniversities = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id, {
      populate: ['savedUniversities']
    });

    res.status(200).json({
      success: true,
      data: user.savedUniversities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save search
// @route   POST /api/users/saved-searches
// @access  Private
exports.saveSearch = async (req, res, next) => {
  try {
    await dbOps.updateUser(req.user.id, {
      $push: {
        savedSearches: {
          name: req.body.name,
          filters: req.body.filters,
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Search saved',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved searches
// @route   GET /api/users/saved-searches
// @access  Private
exports.getSavedSearches = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.savedSearches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete search
// @route   DELETE /api/users/saved-searches/:searchId
// @access  Private
exports.deleteSearch = async (req, res, next) => {
  try {
    await dbOps.updateUser(req.user.id, {
      $pull: { savedSearches: { _id: req.params.searchId } }
    });

    res.status(200).json({
      success: true,
      message: 'Search deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommendations
// @route   GET /api/users/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const { getUniversityRecommendations } = require('../utils/recommendationEngine');

    const recommendations = await getUniversityRecommendations(user, 10);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res, next) => {
  try {
    const allowedFields = [
      'preferredCountries',
      'preferredCourses',
      'budget',
      'englishProficiency',
      'standardizedTests',
      'workExperience'
    ];

    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await dbOps.updateUser(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    await dbOps.deleteUser(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};