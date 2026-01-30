const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getCategories,
  saveOpportunity,
  getSavedOpportunities,
  removeSavedOpportunity,
  updateOpportunityStatus,
  getMyPostedOpportunities,
  getApplicationsForOpportunity
} = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getOpportunities);
router.get('/meta/categories', getCategories);

// Save / Unsave (more specific, before :id)
router.post('/:id/save', protect, saveOpportunity);
router.delete('/:id/save', protect, removeSavedOpportunity);
router.get('/saved/list', protect, getSavedOpportunities);

// Company-specific routes (more specific, before :id)
router.get('/company/mine', protect, authorize('company', 'admin'), getMyPostedOpportunities);
router.get('/:id/applications', protect, authorize('company', 'admin'), getApplicationsForOpportunity);

// Generic routes (least specific, last)
router.get('/:id', getOpportunity);
router.post('/', protect, authorize('admin', 'company'), createOpportunity);
router.put('/:id/status', protect, authorize('admin', 'company'), updateOpportunityStatus);
router.put('/:id', protect, authorize('admin', 'company'), updateOpportunity);
router.delete('/:id', protect, authorize('admin', 'company'), deleteOpportunity);

module.exports = router;module.exports = router;
