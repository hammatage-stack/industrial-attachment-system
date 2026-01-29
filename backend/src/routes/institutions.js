const express = require('express');
const router = express.Router();
const {
  getAllInstitutions,
  getInstitution,
  getInstitutionTypes,
  getCounties,
  getSubCounties,
  createInstitution,
  updateInstitution,
  verifyInstitution,
  deleteInstitution
} = require('../controllers/institutionController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllInstitutions);
router.get('/types/list', getInstitutionTypes);
router.get('/counties', getCounties);
router.get('/sub-counties/:county', getSubCounties);
router.get('/:id', getInstitution);

// Admin routes
router.post('/', protect, authorize('admin'), createInstitution);
router.put('/:id', protect, authorize('admin'), updateInstitution);
router.put('/:id/verify', protect, authorize('admin'), verifyInstitution);
router.delete('/:id', protect, authorize('admin'), deleteInstitution);

module.exports = router;
