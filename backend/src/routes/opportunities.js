const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getCategories
} = require('../controllers/opportunityController');
const { saveOpportunity, getSavedOpportunities, removeSavedOpportunity } = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getOpportunities);
router.get('/meta/categories', getCategories);
router.get('/:id', getOpportunity);

// Admin/Company routes
router.post('/', protect, authorize('admin', 'company'), createOpportunity);
router.put('/:id', protect, authorize('admin', 'company'), updateOpportunity);
router.delete('/:id', protect, authorize('admin', 'company'), deleteOpportunity);
// Company-specific
router.get('/company/mine', protect, authorize('company', 'admin'), require('../controllers/opportunityController').getMyPostedOpportunities);
router.get('/:id/applications', protect, authorize('company', 'admin'), require('../controllers/opportunityController').getApplicationsForOpportunity);
// Save / Unsave
router.post('/:id/save', protect, saveOpportunity);
router.delete('/:id/save', protect, removeSavedOpportunity);
router.get('/saved/list', protect, getSavedOpportunities);

module.exports = router;
