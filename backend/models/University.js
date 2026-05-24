const mongoose = require('mongoose');
const slugify = require('slugify');

const programSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ['Undergraduate', 'Postgraduate', 'PhD', 'Diploma'],
    required: true
  },
  duration: { type: String, required: true },
  specializations: [String],
  tuitionFee: {
    amount: Number,
    currency: { type: String, default: 'USD' },
    period: { type: String, default: 'year' }
  },
  entryRequirements: {
    minimumGPA: Number,
    languageTest: {
      type: { type: String, enum: ['IELTS', 'TOEFL', 'PTE', 'Duolingo'] },
      minimumScore: Number
    },
    standardizedTests: [{
      type: { type: String, enum: ['GRE', 'GMAT', 'SAT', 'ACT'] },
      minimumScore: Number,
      required: Boolean
    }],
    academicRequirements: [String],
    workExperience: String
  },
  applicationDeadline: {
    fall: Date,
    spring: Date,
    summer: Date
  },
  intakePeriods: [String],
  isActive: { type: Boolean, default: true }
});

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'University name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  region: String,
  establishedYear: Number,
  universityType: {
    type: String,
    enum: ['Public', 'Private', 'Research', 'Liberal Arts', 'Technical'],
    required: true
  },
  logo: String,
  coverImage: String,
  images: [String],
  website: String,
  applicationLink: String,
  overview: {
    description: { type: String, required: true },
    mission: String,
    vision: String,
    values: [String]
  },
  rankings: {
    qsRanking: {
      world: Number,
      country: Number,
      year: Number
    },
    timesRanking: {
      world: Number,
      country: Number,
      year: Number
    },
    subjectRankings: [{
      subject: String,
      rank: Number,
      source: String
    }]
  },
  stats: {
    totalStudents: Number,
    internationalStudents: Number,
    facultyCount: Number,
    studentFacultyRatio: String,
    acceptanceRate: Number,
    graduationRate: Number,
    employmentRate: Number,
    averageSalary: {
      amount: Number,
      currency: { type: String, default: 'USD' }
    }
  },
  programs: [programSchema],
  campusLife: {
    accommodation: {
      available: Boolean,
      types: [String],
      cost: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'USD' }
      }
    },
    facilities: [{
      name: String,
      description: String,
      image: String
    }],
    clubs: [String],
    sports: [String],
    libraries: Number,
    laboratories: Number
  },
  admissions: {
    applicationFee: {
      amount: Number,
      currency: { type: String, default: 'USD' }
    },
    requiredDocuments: [String],
    applicationProcess: [String],
    deadlines: {
      fall: Date,
      spring: Date,
      summer: Date
    }
  },
  tuitionFees: {
    undergraduate: {
      domestic: { amount: Number, currency: String },
      international: { amount: Number, currency: String }
    },
    postgraduate: {
      domestic: { amount: Number, currency: String },
      international: { amount: Number, currency: String }
    }
  },
  scholarships: [{
    name: String,
    type: String,
    amount: { type: Number },
    currency: { type: String, default: 'USD' },
    eligibility: [String],
    deadline: Date,
    link: String
  }],
  languageOfInstruction: [String],
  intakePeriods: [String],
  contactInfo: {
    email: String,
    phone: String,
    address: String,
    admissionsEmail: String,
    admissionsPhone: String
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
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
  reviewCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  importedFrom: {
    type: String,
    default: 'csv'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
universitySchema.index({ name: 'text', 'overview.description': 'text' });
universitySchema.index({ country: 1, city: 1 });
universitySchema.index({ 'rankings.qsRanking.world': 1 });
universitySchema.index({ isVerified: 1, isActive: 1 });
universitySchema.index({ location: '2dsphere' });

// Generate slug before saving
universitySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  this.lastUpdated = Date.now();
  next();
});

// Virtual for reviews
universitySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'universityId',
  justOne: false
});

module.exports = mongoose.model('University', universitySchema);