const mongoose = require('mongoose');

const visaGuideSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    unique: true
  },
  visaTypes: [{
    name: String,
    description: String,
    duration: String,
    processingTime: String,
    fee: {
      amount: Number,
      currency: String
    }
  }],
  generalRequirements: [String],
  requiredDocuments: [{
    name: String,
    description: String,
    mandatory: Boolean,
    format: String
  }],
  applicationProcess: [{
    step: Number,
    title: String,
    description: String,
    estimatedTime: String
  }],
  financialRequirements: {
    minimumBankBalance: {
      amount: Number,
      currency: String
    },
    proofOfFunds: [String],
    sponsorshipAllowed: Boolean,
    workPermitAvailable: Boolean
  },
  medicalRequirements: {
    medicalExamRequired: Boolean,
    vaccinationsRequired: [String],
    healthInsurance: {
      required: Boolean,
      minimumCoverage: Number,
      currency: String
    }
  },
  biometrics: {
    required: Boolean,
    validityPeriod: String,
    cost: {
      amount: Number,
      currency: String
    }
  },
  interviewRequirements: {
    required: Boolean,
    location: String,
    schedulingProcess: String,
    tips: [String]
  },
  processingTime: {
    minimum: String,
    maximum: String,
    average: String
  },
  postStudyWorkVisa: {
    available: Boolean,
    duration: String,
    eligibility: [String],
    applicationProcess: String,
    restrictions: [String]
  },
  dependentVisa: {
    available: Boolean,
    eligibleDependents: [String],
    requirements: [String],
    workRights: String
  },
  importantNotes: [String],
  usefulLinks: [{
    title: String,
    url: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('VisaGuide', visaGuideSchema);