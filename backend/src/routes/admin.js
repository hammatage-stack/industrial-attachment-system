const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getOpportunityDetail,
  getApplicationFull,
  getSystemLogs,
  generateReport
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

// Opportunities management
router.get('/opportunities/:id', getOpportunityDetail);

// Applications management
router.get('/applications/:id/full', getApplicationFull);

// System logs and reports
router.get('/logs', getSystemLogs);
router.get('/reports/:type', generateReport);

module.exports = router;
