const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  enrollmentStatus: {
    type: String,
    enum: ['Current Student', 'Alumni', 'Applicant'],
    required: true
  },
  programLevel: {
    type: String,
    enum: ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma'],
    required: true
  },
  programName: String,
  yearOfStudy: String,
  graduationYear: Number,
  ratings: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    academicQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    facilities: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    faculty: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    careerSupport: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    studentLife: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  review: {
    type: String,
    required: true,
    minlength: 100,
    maxlength: 5000
  },
  pros: [String],
  cons: [String],
  photos: [{
    url: String,
    caption: String
  }],
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  verificationProof: {
    type: String,
    default: null
  },
  moderationStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportCount: {
    type: Number,
    default: 0
  },
  reports: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: { type: Date, default: Date.now }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  lastEditedAt: Date
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ universityId: 1, moderationStatus: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ verificationStatus: 1 });
reviewSchema.index({ isPublished: 1 });

// Update university average rating after review is saved
reviewSchema.post('save', async function() {
  if (this.isPublished && this.moderationStatus === 'Approved') {
    const University = mongoose.model('University');
    const reviews = await this.constructor.find({
      universityId: this.universityId,
      isPublished: true,
      moderationStatus: 'Approved'
    });

    const avgRating = reviews.reduce((acc, review) => acc + review.ratings.overall, 0) / reviews.length;

    await University.findByIdAndUpdate(this.universityId, {
      averageRating: avgRating.toFixed(1),
      reviewCount: reviews.length
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);