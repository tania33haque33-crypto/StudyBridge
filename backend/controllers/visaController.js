const VisaGuide = require('../models/VisaGuide');
const dbOps = require('../utils/databaseOperations');

// @desc    Get all visa guides
// @route   GET /api/visa
// @access  Public
exports.getAllVisaGuides = async (req, res, next) => {
  try {
    const guides = await dbOps.findVisaGuides({}, { sort: 'country' });

    res.status(200).json({
      success: true,
      count: guides.length,
      data: guides,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get visa guide by country
// @route   GET /api/visa/:country
// @access  Public
exports.getVisaGuideByCountry = async (req, res, next) => {
  try {
    const guide = await dbOps.findVisaGuide({
      country: new RegExp(`^${req.params.country}$`, 'i')
    });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Visa guide not found for this country',
      });
    }

    res.status(200).json({
      success: true,
      data: guide,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate financial requirements
// @route   POST /api/visa/calculate-financial
// @access  Public
exports.calculateFinancialRequirements = async (req, res, next) => {
  try {
    const { country, tuitionFee, duration, dependents = 0 } = req.body;

    const guide = await dbOps.findVisaGuide({ country });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Visa guide not found',
      });
    }

    // Basic calculation (can be customized)
    const livingExpenses = 12000 * duration; // $12k per year
    const dependentCost = dependents * 6000 * duration;
    const totalRequired = tuitionFee + livingExpenses + dependentCost;

    res.status(200).json({
      success: true,
      data: {
        tuitionFee,
        livingExpenses,
        dependentCost,
        totalRequired,
        minimumBankBalance: guide.financialRequirements?.minimumBankBalance,
        currency: 'USD',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get visa checklist
// @route   POST /api/visa/checklist
// @access  Public
exports.getVisaChecklist = async (req, res, next) => {
  try {
    const { country, visaType } = req.body;

    const guide = await dbOps.findVisaGuide({ country });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Visa guide not found',
      });
    }

    const checklist = {
      generalRequirements: guide.generalRequirements,
      requiredDocuments: guide.requiredDocuments,
      medicalRequirements: guide.medicalRequirements,
      biometrics: guide.biometrics,
      applicationProcess: guide.applicationProcess,
    };

    res.status(200).json({
      success: true,
      data: checklist,
    });
  } catch (error) {
    next(error);
  }
};

// Admin controllers

// @desc    Create visa guide
// @route   POST /api/visa
// @access  Private/Admin
exports.createVisaGuide = async (req, res, next) => {
  try {
    const guide = await dbOps.createVisaGuide(req.body);

    res.status(201).json({
      success: true,
      data: guide,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update visa guide
// @route   PUT /api/visa/:id
// @access  Private/Admin
exports.updateVisaGuide = async (req, res, next) => {
  try {
    const guide = await dbOps.updateVisaGuide(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Visa guide not found',
      });
    }

    res.status(200).json({
      success: true,
      data: guide,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete visa guide
// @route   DELETE /api/visa/:id
// @access  Private/Admin
exports.deleteVisaGuide = async (req, res, next) => {
  try {
    const guide = await dbOps.deleteVisaGuide(req.params.id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Visa guide not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Visa guide deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};