const express = require('express');
const router = express.Router();
const {
  validateMpesaPayment,
  getPaymentStatus,
  getAllPayments,
  verifyPayment,
  rejectPayment,
  flagDuplicatePayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes for students/users
router.post('/validate-mpesa', protect, validateMpesaPayment);
router.get('/:applicationId/status', protect, getPaymentStatus);

// Admin routes
router.get('/', protect, authorize('admin'), getAllPayments);
router.put('/:paymentId/verify', protect, authorize('admin'), verifyPayment);
router.put('/:paymentId/reject', protect, authorize('admin'), rejectPayment);
router.put('/:paymentId/flag-duplicate', protect, authorize('admin'), flagDuplicatePayment);

module.exports = router;
