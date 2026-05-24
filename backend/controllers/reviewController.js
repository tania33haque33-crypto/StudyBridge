const Review = require('../models/Review');
const User = require('../models/User');
const University = require('../models/University');
const dbOps = require('../utils/databaseOperations');
const fs = require('fs');
const path = require('path');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    // Add userId to req.body
    req.body.userId = req.user.id;

    // Create review
    const review = await dbOps.createReview(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews by university
// @route   GET /api/reviews/university/:universityId
// @access  Public
exports.getReviewsByUniversity = async (req, res, next) => {
  try {
    const reviews = await dbOps.findReviews({
      universityId: req.params.universityId,
      isPublished: true,
      moderationStatus: 'Approved'
    }, {
      populate: [{
        path: 'userId',
        select: 'firstName lastName profilePicture'
      }],
      sort: '-createdAt'
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReviewById = async (req, res, next) => {
  try {
    const review = await dbOps.findReviewById(req.params.id, {
      populate: [{
        path: 'userId',
        select: 'firstName lastName profilePicture'
      }, {
        path: 'universityId',
        select: 'name logo'
      }]
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review is published or if user is the owner
    if (!review.isPublished && review.userId._id.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await dbOps.findReviewById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user owns the review
    if (review.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await dbOps.updateReview(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await dbOps.findReviewById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user owns the review or is admin/moderator
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await dbOps.deleteReview(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await dbOps.findReviewById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    if (review.helpfulBy.includes(req.user.id)) {
      // Remove helpful mark
      await dbOps.updateReview(req.params.id, {
        $pull: { helpfulBy: req.user.id },
        $inc: { helpfulCount: -1 }
      });
    } else {
      // Add helpful mark
      await dbOps.updateReview(req.params.id, {
        $push: { helpfulBy: req.user.id },
        $inc: { helpfulCount: 1 }
      });
    }

    const updatedReview = await dbOps.findReviewById(req.params.id);

    res.status(200).json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report review
// @route   POST /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res, next) => {
  try {
    const review = await dbOps.findReviewById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already reported this review
    const alreadyReported = review.reports.some(report =>
      report.userId.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this review'
      });
    }

    // Add report
    await dbOps.updateReview(req.params.id, {
      $push: {
        reports: {
          userId: req.user.id,
          reason: req.body.reason || 'Inappropriate content'
        }
      },
      $inc: { reportCount: 1 }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending reviews
// @route   GET /api/reviews/admin/pending
// @access  Private/Admin/Moderator
exports.getPendingReviews = async (req, res, next) => {
  try {
    const reviews = await dbOps.findReviews({
      moderationStatus: 'Pending'
    }, {
      populate: [{
        path: 'userId',
        select: 'firstName lastName profilePicture'
      }, {
        path: 'universityId',
        select: 'name logo'
      }],
      sort: '-createdAt'
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve review
// @route   PATCH /api/reviews/:id/approve
// @access  Private/Admin/Moderator
exports.approveReview = async (req, res, next) => {
  try {
    const review = await dbOps.updateReview(req.params.id, {
      moderationStatus: 'Approved',
      isPublished: true,
      publishedAt: new Date(),
      moderatedBy: req.user.id,
      moderatedAt: new Date()
    }, {
      new: true
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject review
// @route   PATCH /api/reviews/:id/reject
// @access  Private/Admin/Moderator
exports.rejectReview = async (req, res, next) => {
  try {
    const review = await dbOps.updateReview(req.params.id, {
      moderationStatus: 'Rejected',
      moderatedBy: req.user.id,
      moderatedAt: new Date(),
      moderationNotes: req.body.moderationNotes
    }, {
      new: true
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my reviews
// @route   GET /api/reviews/user/my-reviews
// @access  Private
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await dbOps.findReviews({ userId: req.user.id }, {
      populate: [{
        path: 'universityId',
        select: 'name logo'
      }],
      sort: '-createdAt'
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload review photos
// @route   POST /api/reviews/:id/photos
// @access  Private
exports.uploadReviewPhotos = async (req, res, next) => {
  try {
    const review = await dbOps.findReviewById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user owns the review
    if (review.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }

    const photoUrls = req.files.map(file => `/uploads/reviews/${file.filename}`);

    // Add photos to review
    const photosToAdd = photoUrls.map(url => ({
      url: url,
      caption: req.body.captions ? req.body.captions[photoUrls.indexOf(url)] || '' : ''
    }));

    await dbOps.updateReview(req.params.id, {
      $push: { photos: { $each: photosToAdd } }
    });

    const updatedReview = await dbOps.findReviewById(req.params.id);

    res.status(200).json({
      success: true,
      data: { photos: updatedReview.photos }
    });
  } catch (error) {
    next(error);
  }
};