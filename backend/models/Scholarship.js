const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scholarship name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['University', 'Government', 'Private', 'Merit-based', 'Need-based', 'Sports', 'Research'],
    required: true
  },
  provider: {
    type: String,
    required: [true, 'Provider name is required']
  },
  universityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    default: null
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  studyLevel: [{
    type: String,
    enum: ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma']
  }],
  fieldOfStudy: [String],
  amount: {
    value: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    type: {
      type: String,
      enum: ['Full Tuition', 'Partial Tuition', 'Fixed Amount', 'Percentage'],
      required: true
    },
    percentage: Number
  },
  coverage: {
    tuition: { type: Boolean, default: false },
    accommodation: { type: Boolean, default: false },
    livingExpenses: { type: Boolean, default: false },
    travelAllowance: { type: Boolean, default: false },
    healthInsurance: { type: Boolean, default: false },
    bookAllowance: { type: Boolean, default: false }
  },
  description: {
    type: String,
    required: true
  },
  eligibilityCriteria: {
    nationality: [String],
    minimumGPA: Number,
    ageLimit: {
      min: Number,
      max: Number
    },
    languageRequirements: [{
      test: String,
      minimumScore: Number
    }],
    academicRequirements: [String],
    otherCriteria: [String]
  },
  applicationProcess: [String],
  requiredDocuments: [String],
  deadline: {
    type: Date,
    required: true
  },
  applicationStartDate: Date,
  numberOfScholarships: {
    type: Number,
    default: null
  },
  isRenewable: {
    type: Boolean,
    default: false
  },
  renewalCriteria: String,
  website: String,
  contactEmail: String,
  contactPhone: String,
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  savedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
scholarshipSchema.index({ name: 'text', description: 'text' });
scholarshipSchema.index({ studyLevel: 1 });
scholarshipSchema.index({ deadline: 1 });
scholarshipSchema.index({ isActive: 1 });
scholarshipSchema.index({ type: 1 });

module.exports = mongoose.model('Scholarship', scholarshipSchema);