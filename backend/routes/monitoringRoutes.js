const express = require('express');
const router = express.Router();
const dbOps = require('../utils/databaseOperations');
const { protect } = require('../middleware/auth');

// @desc    Get database health status
// @route   GET /api/admin/db-health
// @access  Private/Admin
router.get('/db-health', protect, async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access database health'
      });
    }

    const health = await dbOps.checkConnectionHealth();

    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Validate MongoDB Atlas connection
// @route   POST /api/admin/validate-db
// @access  Private/Admin
router.post('/validate-db', protect, async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can validate database'
      });
    }

    const validation = await dbOps.validateAtlasConnection();

    res.status(200).json({
      success: true,
      data: validation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get database metrics
// @route   GET /api/admin/db-metrics
// @access  Private/Admin
router.get('/db-metrics', protect, async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access database metrics'
      });
    }

    const metrics = dbOps.getMetrics();

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reset database metrics
// @route   POST /api/admin/reset-db-metrics
// @access  Private/Admin
router.post('/reset-db-metrics', protect, async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reset database metrics'
      });
    }

    dbOps.resetMetrics();

    res.status(200).json({
      success: true,
      message: 'Database metrics reset successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get circuit breaker status
// @route   GET /api/admin/circuit-breaker
// @access  Private/Admin
router.get('/circuit-breaker', protect, async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access circuit breaker status'
      });
    }

    const status = dbOps.getCircuitBreakerStatus();

    res.status(200).json({
      success: true,
      data: {
        ...status,
        description: {
          'CLOSED': 'Database operations running normally',
          'OPEN': 'Database operations temporarily disabled (too many failures)',
          'HALF_OPEN': 'Testing database connectivity after failures'
        }[status.state],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reset circuit breaker
// @route   POST /api/admin/reset-circuit-breaker
// @access  Private/Admin
router.post('/reset-circuit-breaker', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reset circuit breaker'
      });
    }

    dbOps.resetCircuitBreaker();

    res.status(200).json({
      success: true,
      message: 'Circuit breaker reset successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;