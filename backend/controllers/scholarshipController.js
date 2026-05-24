const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const dbOps = require('../utils/databaseOperations');

// @desc    Get all scholarships
// @route   GET /api/scholarships
// @access  Public
exports.getAllScholarships = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    if (req.query.country) {
      query.country = req.query.country;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const scholarships = await dbOps.findScholarships(query, {
      skip,
      limit,
      sort: '-createdAt'
    });

    const total = await dbOps.countScholarships(query);

    res.status(200).json({
      success: true,
      count: scholarships.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: scholarships,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search scholarships
// @route   GET /api/scholarships/search
// @access  Public
exports.searchScholarships = async (req, res, next) => {
  try {
    const {
      q,
      country,
      type,
      studyLevel,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20,
      sortBy = '-amount.value',
    } = req.query;

    const query = { isActive: true };

    if (q) {
      query.$text = { $search: q };
    }

    if (country) {
      query.country = Array.isArray(country) ? { $in: country } : country;
    }

    if (type) {
      query.type = Array.isArray(type) ? { $in: type } : type;
    }

    if (studyLevel) {
      query.studyLevel = Array.isArray(studyLevel) ? { $in: studyLevel } : studyLevel;
    }

    if (minAmount || maxAmount) {
      query['amount.value'] = {};
      if (minAmount) query['amount.value'].$gte = parseFloat(minAmount);
      if (maxAmount) query['amount.value'].$lte = parseFloat(maxAmount);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const scholarships = await dbOps.findScholarships(query, {
      skip,
      limit: parseInt(limit),
      sort: sortBy
    });

    const total = await dbOps.countScholarships(query);

    res.status(200).json({
      success: true,
      count: scholarships.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: scholarships,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get scholarship by ID
// @route   GET /api/scholarships/:id
// @access  Public
exports.getScholarshipById = async (req, res, next) => {
  try {
    const scholarship = await dbOps.findScholarshipById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    // Increment view count
    await dbOps.updateScholarship(req.params.id, {
      $inc: { viewCount: 1 }
    });

    res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save scholarship
// @route   POST /api/scholarships/:id/save
// @access  Private
exports.saveScholarship = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id);

    if (user.savedScholarships.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Scholarship already saved',
      });
    }

    user.savedScholarships.push(req.params.id);
    await dbOps.updateUser({ _id: req.user.id }, { savedScholarships: user.savedScholarships });

    // Increment saved count
    await dbOps.updateScholarship(req.params.id, {
      $inc: { savedCount: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Scholarship saved successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsave scholarship
// @route   DELETE /api/scholarships/:id/save
// @access  Private
exports.unsaveScholarship = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id);

    user.savedScholarships = user.savedScholarships.filter(
      (id) => id.toString() !== req.params.id
    );
    await dbOps.updateUser({ _id: req.user.id }, { savedScholarships: user.savedScholarships });

    // Decrement saved count
    await dbOps.updateScholarship(req.params.id, {
      $inc: { savedCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Scholarship removed from saved list',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved scholarships
// @route   GET /api/scholarships/user/saved
// @access  Private
exports.getSavedScholarships = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id, {
      populate: ['savedScholarships']
    });

    res.status(200).json({
      success: true,
      data: user.savedScholarships,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter options for scholarships
// @route   GET /api/scholarships/filter-options
// @access  Public
exports.getFilterOptions = async (req, res, next) => {
  try {
    const countries = await Scholarship.distinct('country', { isActive: true });
    const types = await Scholarship.distinct('type', { isActive: true });
    const studyLevels = ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma'];
    
    // Get unique fieldOfStudy values
    const fieldOfStudyResults = await Scholarship.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$fieldOfStudy' },
      { $group: { _id: '$fieldOfStudy' } },
      { $project: { _id: 0, fieldOfStudy: '$_id' } },
      { $sort: { fieldOfStudy: 1 } }
    ]);
    const fieldsOfStudy = fieldOfStudyResults.map(item => item.fieldOfStudy);

    res.status(200).json({
      success: true,
      data: {
        countries: countries.sort(),
        types: types.sort(),
        studyLevels,
        fieldsOfStudy
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming scholarship deadlines
// @route   GET /api/scholarships/upcoming-deadlines
// @access  Public
exports.getUpcomingDeadlines = async (req, res, next) => {
  try {
    const scholarships = await dbOps.findScholarships({
      isActive: true,
      deadline: { $gte: new Date() }
    }, {
      select: 'name provider country studyLevel amount deadline',
      sort: 'deadline',
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: scholarships
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended scholarships for user
// @route   GET /api/scholarships/user/recommended
// @access  Private
exports.getRecommendedScholarships = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query based on user's profile
    const query = { isActive: true };

    // Filter by country if specified in user profile
    if (user.country) {
      query.country = user.country;
    }

    // Filter by study level if specified in user profile
    if (user.studyLevel && user.studyLevel.length > 0) {
      query.studyLevel = { $in: user.studyLevel };
    }

    // Filter by field of study if specified in user profile
    if (user.fieldOfStudy && user.fieldOfStudy.length > 0) {
      query.fieldOfStudy = { $in: user.fieldOfStudy };
    }

    // Get scholarships sorted by relevance (newest first for now)
    const scholarships = await dbOps.findScholarships(query, {
      sort: '-createdAt',
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: scholarships
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle scholarship status
// @route   PATCH /api/scholarships/:id/toggle-status
// @access  Private/Admin
exports.toggleScholarshipStatus = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    scholarship.isActive = !scholarship.isActive;
    await scholarship.save();

    res.status(200).json({
      success: true,
      data: scholarship
    });
  } catch (error) {
    next(error);
  }
};

// Admin controllers

// @desc    Create scholarship
// @route   POST /api/scholarships
// @access  Private/Admin
exports.createScholarship = async (req, res, next) => {
  try {
    const scholarship = await dbOps.createScholarship(req.body);

    res.status(201).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update scholarship
// @route   PUT /api/scholarships/:id
// @access  Private/Admin
exports.updateScholarship = async (req, res, next) => {
  try {
    const scholarship = await dbOps.updateScholarship(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete scholarship
// @route   DELETE /api/scholarships/:id
// @access  Private/Admin
exports.deleteScholarship = async (req, res, next) => {
  try {
    const scholarship = await dbOps.deleteScholarship(req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scholarship deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};