const mongoose = require('mongoose');

const studyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isPublic: { type: Boolean, default: false },
  displayName: { type: String, trim: true, maxlength: 100 },
  shareAnonymously: { type: Boolean, default: false },

  // Study Goal
  studyLevel: { type: String, enum: ['Bachelor', 'Master', 'PhD'], required: true },

  // BD Academic Background
  sscGPA: { type: Number, min: 0, max: 5 },
  sscGroup: { type: String, enum: ['Science', 'Commerce', 'Arts', 'Other'] },
  sscYear: Number,
  hscGPA: { type: Number, min: 0, max: 5 },
  hscGroup: { type: String, enum: ['Science', 'Commerce', 'Arts', 'Other'] },
  hscYear: Number,
  bachelorCGPA: { type: Number, min: 0, max: 5 },
  bachelorScale: { type: String, enum: ['4.0', '5.0'], default: '4.0' },
  bachelorDepartment: String,
  bachelorUniversity: String,
  mediumOfStudy: { type: String, enum: ['English', 'Bengali', 'Mixed'], default: 'Mixed' },

  // English Proficiency
  hasIELTS: { type: Boolean, default: false },
  ieltsOverall: { type: Number, min: 0, max: 9 },
  ieltsListening: { type: Number, min: 0, max: 9 },
  ieltsReading: { type: Number, min: 0, max: 9 },
  ieltsWriting: { type: Number, min: 0, max: 9 },
  ieltsSpeaking: { type: Number, min: 0, max: 9 },
  hasTOEFL: { type: Boolean, default: false },
  toeflScore: { type: Number, min: 0, max: 120 },

  // Preferences
  preferredSubjects: [String],
  preferredCountries: [String],
  budgetMin: { type: Number, default: 0 },
  budgetMax: { type: Number, default: 50000 },
  targetYear: Number,

  // Goals
  futureGoals: { type: String, maxlength: 2000 },
}, { timestamps: true });

studyProfileSchema.index({ user: 1 });
studyProfileSchema.index({ isPublic: 1, createdAt: -1 });
studyProfileSchema.index({ preferredCountries: 1 });
studyProfileSchema.index({ studyLevel: 1 });

module.exports = mongoose.model('StudyProfile', studyProfileSchema);
