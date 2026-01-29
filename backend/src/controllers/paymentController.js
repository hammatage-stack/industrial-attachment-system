const Payment = require('../models/Payment');
const Application = require('../models/Application');
const config = require('../config/config');

// @desc    Validate and process manual MPesa payment
// @route   POST /api/payments/validate-mpesa
// @access  Private
exports.validateMpesaPayment = async (req, res) => {
  try {
    const { applicationId, mpesaCode, phoneNumber } = req.body;

    // Validate inputs
    if (!applicationId || !mpesaCode || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, MPesa code, and phone number are required'
      });
    }

    // Validate MPesa code format (assuming format like: ABC1234567)
    if (!/^[A-Z0-9]{10}$/i.test(mpesaCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid M-Pesa transaction code format. Expected format: ABC1234567'
      });
    }

    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify ownership
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process payment for this application'
      });
    }

    // Check if payment already completed
    if (application.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been completed for this application'
      });
    }

    // Check if the MPesa code has already been used (avoid duplicates)
    const existingPayment = await Payment.findOne({
      mpesaCode: mpesaCode.toUpperCase()
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'This M-Pesa transaction code has already been used. Each transaction can only be used once.'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      application: applicationId,
      user: req.user.id,
      amount: config.applicationFee,
      mpesaCode: mpesaCode.toUpperCase(),
      phoneNumber,
      status: 'pending'
    });

    // Update application
    application.payment.status = 'pending';
    application.payment.mpesaCode = mpesaCode.toUpperCase();
    application.payment.phoneNumber = phoneNumber;
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Payment submission received. Awaiting verification from admin.',
      payment,
      applicationId
    });
  } catch (error) {
    console.error('Validate MPesa payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:applicationId/status
// @access  Private
exports.getPaymentStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const payment = await Payment.findOne({ application: applicationId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No payment found for this application'
      });
    }

    // Verify ownership
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        status: payment.status,
        mpesaCode: payment.mpesaCode,
        verifiedAt: payment.verifiedAt,
        rejectionReason: payment.rejectionReason
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
};

// @desc    Admin: Get all pending payments
// @route   GET /api/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const payments = await Payment.find(query)
      .populate('application', 'firstName lastName email institution course')
      .populate('user', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName')
      .populate('rejectedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      payments
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// @desc    Admin: Verify payment
// @route   PUT /api/payments/:paymentId/verify
// @access  Private/Admin
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { verificationNotes } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'verified';
    payment.verifiedAt = new Date();
    payment.verifiedBy = req.user.id;
    payment.verificationNotes = verificationNotes || '';

    await payment.save();

    // Update application status to submitted
    const application = await Application.findById(payment.application);
    if (application) {
      application.payment.status = 'completed';
      application.payment.mpesaReceiptNumber = payment.mpesaCode;
      application.payment.paymentDate = payment.verifiedAt;
      application.status = 'submitted';
      application.submittedAt = new Date();
      await application.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// @desc    Admin: Reject payment
// @route   PUT /api/payments/:paymentId/reject
// @access  Private/Admin
exports.rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'rejected';
    payment.rejectedAt = new Date();
    payment.rejectedBy = req.user.id;
    payment.rejectionReason = rejectionReason;

    await payment.save();

    // Update application payment status
    const application = await Application.findById(payment.application);
    if (application) {
      application.payment.status = 'failed';
      await application.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment rejected',
      payment
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting payment',
      error: error.message
    });
  }
};

// @desc    Admin: Flag payment as duplicate
// @route   PUT /api/payments/:paymentId/flag-duplicate
// @access  Private/Admin
exports.flagDuplicatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'duplicate';
    payment.rejectionReason = 'Duplicate payment - same transaction code used previously';
    payment.rejectedAt = new Date();
    payment.rejectedBy = req.user.id;

    await payment.save();

    // Update application payment status
    const application = await Application.findById(payment.application);
    if (application) {
      application.payment.status = 'failed';
      await application.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment flagged as duplicate',
      payment
    });
  } catch (error) {
    console.error('Flag duplicate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error flagging payment',
      error: error.message
    });
  }
};
