const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const mpesaService = require('../utils/mpesaService');
const emailService = require('../utils/emailServiceEnhanced');
const config = require('../config/config');

// @desc    Create/Save application draft
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    // Allow clients to set status when applying (e.g., 'pending') but default to 'draft'
    const allowedStatuses = ['draft', 'pending', 'submitted'];
    const statusFromClient = req.body.status && allowedStatuses.includes(req.body.status) ? req.body.status : 'draft';

    // Prevent duplicate applications (same student + same opportunity)
    if (req.body.opportunity) {
      const existing = await Application.findOne({
        applicant: req.user.id,
        opportunity: req.body.opportunity
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this opportunity. Only one application per opportunity allowed.'
        });
      }
    }

    // Prevent duplicate MPesa transaction codes
    if (req.body.payment?.mpesaReceiptNumber) {
      const existingPayment = await Application.findOne({
        'payment.mpesaReceiptNumber': req.body.payment.mpesaReceiptNumber
      });
      if (existingPayment) {
        return res.status(400).json({
          success: false,
          message: 'This MPesa transaction code has already been used. Duplicate payments are not allowed.'
        });
      }
    }

    const applicationData = {
      ...req.body,
      applicant: req.user.id,
      status: statusFromClient
    };

    if (statusFromClient === 'pending' || statusFromClient === 'submitted') {
      applicationData.submittedAt = new Date();
      // Initialize timeline
      applicationData.timeline = [{
        status: 'submitted',
        timestamp: new Date(),
        updatedBy: req.user.id,
        notes: 'Application submitted'
      }];
    }

    const application = await Application.create(applicationData);

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate ${field}: ${error.keyValue[field]}. Each ${field} can only be used once.`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating application',
      error: error.message
    });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res) => {
  try {
    let application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Only allow updates if application is in draft or payment pending
    if (!['draft', 'pending'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update submitted application'
      });
    }

    application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Application updated',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
};

// @desc    Initiate payment for application
// @route   POST /api/applications/:id/payment
// @access  Private
exports.initiatePayment = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if payment already completed
    if (application.payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this application'
      });
    }

    // Initiate M-Pesa STK Push
    const paymentResponse = await mpesaService.initiateSTKPush(
      phoneNumber,
      config.applicationFee,
      `APP-${application._id}`,
      'Application Fee'
    );

    // Update application with payment info
    application.payment.phoneNumber = phoneNumber;
    application.payment.transactionId = paymentResponse.checkoutRequestId;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Payment initiated. Please check your phone for M-Pesa prompt.',
      checkoutRequestId: paymentResponse.checkoutRequestId,
      customerMessage: paymentResponse.customerMessage
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error initiating payment'
    });
  }
};

// @desc    M-Pesa callback
// @route   POST /api/applications/mpesa/callback
// @access  Public (M-Pesa)
exports.mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa Callback:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    const { stkCallback } = Body;

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Find application by checkout request ID
    const application = await Application.findOne({
      'payment.transactionId': CheckoutRequestID
    });

    if (!application) {
      console.error('Application not found for CheckoutRequestID:', CheckoutRequestID);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata.Item;
      const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find(item => item.Name === 'Amount')?.Value;

      // Check for duplicate MPesa code
      const duplicatePayment = await Application.findOne({
        'payment.mpesaReceiptNumber': mpesaReceiptNumber,
        _id: { $ne: application._id }
      });

      if (duplicatePayment) {
        application.payment.status = 'rejected';
        application.status = 'rejected';
        application.rejectionReason = 'Duplicate MPesa transaction code detected';
        application.timeline.push({
          status: 'rejected',
          timestamp: new Date(),
          notes: 'Duplicate payment detected'
        });
        await application.save();
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Duplicate payment rejected' });
      }

      application.payment.status = 'pending'; // Changed from 'completed' to 'pending' for admin review
      application.payment.mpesaReceiptNumber = mpesaReceiptNumber;
      application.payment.amount = amount;
      application.payment.paymentDate = new Date();
      application.status = 'payment-submitted';
      application.submittedAt = new Date();

      // Add to timeline
      application.timeline.push({
        status: 'payment-submitted',
        timestamp: new Date(),
        notes: `Payment received: ${mpesaReceiptNumber}`
      });

      await application.save();

      console.log('Payment submitted for application:', application._id);
    } else {
      // Payment failed
      application.payment.status = 'failed';
      application.status = 'rejected';
      application.timeline.push({
        status: 'rejected',
        timestamp: new Date(),
        notes: `Payment failed: ${ResultDesc}`
      });
      await application.save();

      console.log('Payment failed for application:', application._id, ResultDesc);
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(200).json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
};

// @desc    Check payment status
// @route   GET /api/applications/:id/payment/status
// @access  Private
exports.checkPaymentStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      paymentStatus: application.payment.status,
      applicationStatus: application.status,
      payment: application.payment
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking payment status',
      error: error.message
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/applications/my
// @access  Private
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('opportunity', 'title companyName type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('opportunity')
      .populate('applicant', 'email firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership or admin
    if (
      application.applicant._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications
// @access  Private/Admin
exports.getAllApplications = async (req, res) => {
  try {
    const { status, opportunity, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (opportunity) query.opportunity = opportunity;

    const applications = await Application.find(query)
      .populate('opportunity', 'title companyName type')
      .populate('applicant', 'email firstName lastName phoneNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      applications
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Update application status (Admin)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.id;

    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    // Audit log for status update
    try {
      const Audit = require('../models/Audit');
      await Audit.create({
        action: 'update_application_status',
        resource: 'Application',
        resourceId: application._id,
        performedBy: req.user.id,
        details: { status }
      });
    } catch (e) {
      console.error('Audit log error:', e);
    }

    // Notify applicant
    try {
      const Notification = require('../models/Notification');
      const notif = await Notification.create({
        user: application.applicant,
        type: 'application_status',
        message: `Your application status changed to ${status}`,
        link: `/applications/${application._id}`
      });
      const io = req.app.get('io');
      if (io) io.to(application.applicant.toString()).emit('notification', notif);
    } catch (e) {
      console.error('Notification error:', e);
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};
