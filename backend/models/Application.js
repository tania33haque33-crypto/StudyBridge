const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship'
  },
  programId: {
    type: String,
    required: true
  },
  programName: {
    type: String,
    required: true
  },
  scholarshipName: {
    type: String
  },
  intake: {
    type: String,
    required: true,
    enum: ['Fall', 'Spring', 'Summer', 'Winter']
  },
  intakeYear: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Submitted', 'Under Review', 'Accepted', 'Rejected', 'Waitlisted', 'Deferred'],
    default: 'Not Started'
  },
  applicationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  timeline: {
    started: Date,
    submitted: Date,
    underReview: Date,
    decision: Date,
    autoCreated: Boolean
  },
  autoCreated: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['manual', 'auto_match', 'bulk_import'],
    default: 'manual'
  },
  deadline: {
    type: Date,
    required: true
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['Transcript', 'SOP', 'LOR', 'Resume', 'Test Score', 'Passport', 'Financial Document', 'Other']
    },
    url: String,
    uploadedAt: Date,
    status: {
      type: String,
      enum: ['Pending', 'Uploaded', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    rejectionReason: String
  }],
  testScores: {
    languageTest: {
      type: { type: String, enum: ['IELTS', 'TOEFL', 'PTE', 'Duolingo'] },
      score: Number,
      date: Date
    },
    standardizedTests: [{
      type: { type: String, enum: ['GRE', 'GMAT', 'SAT', 'ACT'] },
      score: Number,
      date: Date
    }]
  },
  academicDetails: {
    gpa: Number,
    gradeScale: String,
    lastInstitution: String,
    degreeType: String,
    major: String,
    graduationDate: Date
  },
  personalStatement: {
    content: String,
    uploadedFile: String,
    wordCount: Number
  },
  recommendationLetters: [{
    recommenderName: String,
    recommenderEmail: String,
    recommenderPosition: String,
    institution: String,
    status: {
      type: String,
      enum: ['Pending', 'Requested', 'Submitted'],
      default: 'Pending'
    },
    submittedAt: Date
  }],
  financialInfo: {
    fundingSource: String,
    sponsorDetails: String,
    bankStatement: String,
    estimatedBudget: Number
  },
  applicationFee: {
    amount: Number,
    currency: String,
    paid: { type: Boolean, default: false },
    paidAt: Date,
    transactionId: String
  },
  notes: [{
    content: String,
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: true }
  }],
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: String,
    notes: String
  }],
  decisionDetails: {
    decision: String,
    receivedDate: Date,
    decisionLetter: String,
    conditions: [String],
    scholarshipOffered: {
      name: String,
      amount: Number,
      currency: String
    }
  },
  remindersSent: [{
    type: String,
    sentAt: Date
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ universityId: 1 });
applicationSchema.index({ deadline: 1 });
applicationSchema.index({ status: 1 });

// Generate application number before saving
applicationSchema.pre('save', async function(next) {
  if (this.isNew && !this.applicationNumber) {
    const count = await this.constructor.countDocuments();
    this.applicationNumber = `APP${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);