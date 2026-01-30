const Application = require('../models/Application');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

/**
 * Get all pending payments for admin review
 * @route   GET /api/admin/payments/pending
 * @access  Admin only
 */
exports.getPendingPayments = async (req, res) => {
  try {
    const pendingApplications = await Application.find({
      'payment.status': 'pending'
    })
      .populate('applicant', 'fullName email phoneNumber')
      .populate('opportunity', 'title companyName')
      .sort({ 'payment.paymentDate': -1 });

    res.status(200).json({
      success: true,
      count: pendingApplications.length,
      data: pendingApplications
    });
  } catch (error) {
    logger.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending payments',
      error: error.message
    });
  }
};

/**
 * Verify a payment (approve)
 * @route   POST /api/admin/payments/:applicationId/verify
 * @access  Admin only
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${application.payment.status}`
      });
    }

    // Update payment status
    application.payment.status = 'verified';
    application.payment.verifiedAt = new Date();
    application.payment.verifiedBy = req.user.id;

    // Update application status
    application.status = 'payment-verified';

    // Add timeline entry
    application.timeline.push({
      status: 'payment-verified',
      timestamp: new Date(),
      updatedBy: req.user.id,
      notes: notes || 'Payment verified by admin'
    });

    await application.save();

    logger.info(`Payment verified for application ${applicationId} by admin ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: application
    });
  } catch (error) {
    logger.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

/**
 * Reject a payment
 * @route   POST /api/admin/payments/:applicationId/reject
 * @access  Admin only
 */
exports.rejectPayment = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject payment that is already ${application.payment.status}`
      });
    }

    // Update payment status
    application.payment.status = 'rejected';
    application.payment.verifiedAt = new Date();
    application.payment.verifiedBy = req.user.id;

    // Update application status
    application.status = 'rejected';
    application.rejectionReason = reason;

    // Add timeline entry
    application.timeline.push({
      status: 'rejected',
      timestamp: new Date(),
      updatedBy: req.user.id,
      notes: `Payment rejected: ${reason}`
    });

    await application.save();

    logger.info(`Payment rejected for application ${applicationId} by admin ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Payment rejected successfully',
      data: application
    });
  } catch (error) {
    logger.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting payment',
      error: error.message
    });
  }
};

/**
 * Get payment verification stats
 * @route   GET /api/admin/payments/stats
 * @access  Admin only
 */
exports.getPaymentStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$payment.status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$payment.amount' }
        }
      }
    ]);

    const totalPending = await Application.countDocuments({ 'payment.status': 'pending' });
    const totalVerified = await Application.countDocuments({ 'payment.status': 'verified' });
    const totalRejected = await Application.countDocuments({ 'payment.status': 'rejected' });

    res.status(200).json({
      success: true,
      stats: {
        pending: totalPending,
        verified: totalVerified,
        rejected: totalRejected,
        breakdown: stats
      }
    });
  } catch (error) {
    logger.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment stats',
      error: error.message
    });
  }
};
