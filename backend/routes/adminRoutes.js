const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  suspendUser,
  unsuspendUser,
  deleteUser,
  verifyUser,
  getUniversityStats,
  getApplicationStats,
  getRevenueStats,
  getPopularSearches,
  getUserActivityLogs,
  getSystemHealth,
  updateSystemSettings,
  getSystemSettings,
  sendBulkEmail,
  exportData
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/university-stats', getUniversityStats);
router.get('/dashboard/application-stats', getApplicationStats);
router.get('/dashboard/revenue-stats', getRevenueStats);
router.get('/dashboard/popular-searches', getPopularSearches);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/unsuspend', unsuspendUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/verify', verifyUser);
router.get('/users/:id/activity-logs', getUserActivityLogs);

// System management
router.get('/system/health', getSystemHealth);
router.get('/system/settings', getSystemSettings);
router.put('/system/settings', updateSystemSettings);

// Utilities
router.post('/bulk-email', sendBulkEmail);
router.post('/export-data', exportData);

module.exports = router;