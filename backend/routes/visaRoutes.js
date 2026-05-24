const express = require('express');
const router = express.Router();
const {
  getAllVisaGuides,
  getVisaGuideByCountry,
  calculateFinancialRequirements,
  getVisaChecklist,
  createVisaGuide,
  updateVisaGuide,
  deleteVisaGuide
} = require('../controllers/visaController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllVisaGuides);
router.get('/:country', getVisaGuideByCountry);
router.post('/calculate-financial', calculateFinancialRequirements);
router.post('/checklist', getVisaChecklist);

// Admin routes
router.use(protect);
router.use(authorize('admin', 'moderator'));
router.post('/', createVisaGuide);
router.put('/:id', updateVisaGuide);
router.delete('/:id', deleteVisaGuide);

module.exports = router;