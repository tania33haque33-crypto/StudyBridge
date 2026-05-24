const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Registration validation
exports.registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

// Login validation
exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// University creation validation
exports.universityValidation = [
  body('name').trim().notEmpty().withMessage('University name is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('universityType').isIn(['Public', 'Private', 'Research', 'Liberal Arts', 'Technical'])
    .withMessage('Invalid university type'),
];

// Application creation validation
exports.applicationValidation = [
  body('universityId').isMongoId().withMessage('Invalid university ID'),
  body('programId').notEmpty().withMessage('Program ID is required'),
  body('intake').isIn(['Fall', 'Spring', 'Summer', 'Winter'])
    .withMessage('Invalid intake period'),
  body('intakeYear').isInt({ min: 2024, max: 2030 })
    .withMessage('Invalid intake year'),
  body('deadline').isISO8601().withMessage('Invalid deadline date'),
];

// Review validation
exports.reviewValidation = [
  body('universityId').isMongoId().withMessage('Invalid university ID'),
  body('enrollmentStatus').isIn(['Current Student', 'Alumni', 'Applicant'])
    .withMessage('Invalid enrollment status'),
  body('ratings.overall').isFloat({ min: 1, max: 5 })
    .withMessage('Overall rating must be between 1 and 5'),
  body('ratings.academicQuality').isFloat({ min: 1, max: 5 }),
  body('ratings.facilities').isFloat({ min: 1, max: 5 }),
  body('ratings.faculty').isFloat({ min: 1, max: 5 }),
  body('ratings.careerSupport').isFloat({ min: 1, max: 5 }),
  body('ratings.studentLife').isFloat({ min: 1, max: 5 }),
  body('ratings.valueForMoney').isFloat({ min: 1, max: 5 }),
  body('title').trim().isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('review').trim().isLength({ min: 100, max: 5000 })
    .withMessage('Review must be between 100 and 5000 characters'),
];

// Query parameter validation
exports.paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// ID parameter validation
exports.idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];