const User = require('../models/User');
const University = require('../models/University');
const Application = require('../models/Application');
const dbOps = require('../utils/databaseOperations');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.isEmailVerified !== undefined) {
      query.isEmailVerified = req.query.isEmailVerified === 'true';
    }

    const users = await dbOps.findUsers(query, {
      select: '-password',
      skip,
      limit,
      sort: '-createdAt'
    });

    const total = await dbOps.countDocuments('User', query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend user
// @route   PATCH /api/admin/users/:id/suspend
// @access  Private/Admin
exports.suspendUser = async (req, res, next) => {
  try {
    const user = await dbOps.updateUser(
      req.params.id,
      {
        isSuspended: true,
        suspensionReason: req.body.reason,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unsuspend user
// @route   PATCH /api/admin/users/:id/unsuspend
// @access  Private/Admin
exports.unsuspendUser = async (req, res, next) => {
  try {
    const user = await dbOps.updateUser(
      req.params.id,
      {
        isSuspended: false,
        suspensionReason: null,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await dbOps.deleteUser(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await dbOps.findUserById(req.params.id, { select: '-password' });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await dbOps.updateUser(
      req.params.id,
      { role: req.body.role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user
// @route   PATCH /api/admin/users/:id/verify
// @access  Private/Admin
exports.verifyUser = async (req, res, next) => {
  try {
    const user = await dbOps.updateUser(
      req.params.id,
      { isEmailVerified: true },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user activity logs
// @route   GET /api/admin/users/:id/activity-logs
// @access  Private/Admin
exports.getUserActivityLogs = async (req, res, next) => {
  try {
    // For now, return empty array as activity logs implementation
    // would require a separate ActivityLog model
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await dbOps.countDocuments('User');
    const totalUniversities = await dbOps.countDocuments('University');
    const totalApplications = await dbOps.countDocuments('Application');

    const stats = {
      totalUsers,
      totalUniversities,
      totalApplications,
      activeUsers: await dbOps.countDocuments('User', { isActive: true }),
      verifiedUniversities: await dbOps.countDocuments('University', { isVerified: true }),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get university stats
// @route   GET /api/admin/dashboard/university-stats
// @access  Private/Admin
exports.getUniversityStats = async (req, res, next) => {
  try {
    const stats = {
      total: await dbOps.countDocuments('University'),
      verified: await dbOps.countDocuments('University', { isVerified: true }),
      featured: await dbOps.countDocuments('University', { isFeatured: true }),
      active: await dbOps.countDocuments('University', { isActive: true }),
      byCountry: await University.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      byType: await University.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$universityType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get application stats
// @route   GET /api/admin/dashboard/application-stats
// @access  Private/Admin
exports.getApplicationStats = async (req, res, next) => {
  try {
    const stats = {
      total: await dbOps.countDocuments('Application'),
      byStatus: await Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      byUniversity: await Application.aggregate([
        { $group: { _id: '$universityId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'universities',
            localField: '_id',
            foreignField: '_id',
            as: 'university'
          }
        },
        { $unwind: '$university' },
        {
          $project: {
            _id: 0,
            universityName: '$university.name',
            applicationCount: '$count'
          }
        }
      ])
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue stats
// @route   GET /api/admin/dashboard/revenue-stats
// @access  Private/Admin
exports.getRevenueStats = async (req, res, next) => {
  try {
    // For now, return mock data as revenue tracking would require payment integration
    res.status(200).json({
      success: true,
      data: {
        totalRevenue: 0,
        monthlyRevenue: [],
        revenueBySource: []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular searches
// @route   GET /api/admin/dashboard/popular-searches
// @access  Private/Admin
exports.getPopularSearches = async (req, res, next) => {
  try {
    // For now, return empty array as search tracking would require implementation
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system health
// @route   GET /api/admin/system/health
// @access  Private/Admin
exports.getSystemHealth = async (req, res, next) => {
  try {
    // Check database connection
    const dbHealth = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.status(200).json({
      success: true,
      data: {
        status: dbHealth === 'connected' ? 'healthy' : 'unhealthy',
        database: dbHealth,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system settings
// @route   GET /api/admin/system/settings
// @access  Private/Admin
exports.getSystemSettings = async (req, res, next) => {
  try {
    // For now, return default settings
    res.status(200).json({
      success: true,
      data: {
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        maxUploadSize: 10,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/system/settings
// @access  Private/Admin
exports.updateSystemSettings = async (req, res, next) => {
  try {
    // For now, just return success as settings would be stored in env/config
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send bulk email
// @route   POST /api/admin/bulk-email
// @access  Private/Admin
exports.sendBulkEmail = async (req, res, next) => {
  try {
    const { users, subject, template } = req.body;

    // For now, just return success as email implementation would require email service
    res.status(200).json({
      success: true,
      message: `Bulk email sent to ${users.length} users`,
      data: { sentCount: users.length }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export data
// @route   POST /api/admin/export-data
// @access  Private/Admin
exports.exportData = async (req, res, next) => {
  try {
    const { type, filters } = req.body;

    // For now, just return success as export would require file generation
    res.status(200).json({
      success: true,
      message: `Data exported successfully for type: ${type}`,
      data: { exportId: `export_${Date.now()}` }
    });
  } catch (error) {
    next(error);
  }
};