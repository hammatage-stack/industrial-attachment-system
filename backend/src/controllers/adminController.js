const User = require('../models/User');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Institution = require('../models/Institution');
const Payment = require('../models/Payment');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalApplications = await Application.countDocuments();
    const totalOpportunities = await Opportunity.countDocuments();
    const totalInstitutions = await Institution.countDocuments();
    
    const submittedApplications = await Application.countDocuments({ status: 'submitted' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const verifiedPayments = await Payment.countDocuments({ status: 'verified' });
    
    const activeOpportunities = await Opportunity.countDocuments({ status: 'open' });
    const closedOpportunities = await Opportunity.countDocuments({ status: 'closed' });
    
    const verifiedInstitutions = await Institution.countDocuments({
      status: 'active',
      isVerified: true
    });
    const pendingInstitutions = await Institution.countDocuments({
      status: 'pending-verification'
    });

    // Get recent applications
    const recentApplications = await Application.find()
      .populate('applicant', 'firstName lastName email')
      .populate('opportunity', 'title companyName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get application status distribution
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get payment status distribution
    const paymentsByStatus = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers
        },
        applications: {
          total: totalApplications,
          submitted: submittedApplications,
          byStatus: applicationsByStatus
        },
        opportunities: {
          total: totalOpportunities,
          active: activeOpportunities,
          closed: closedOpportunities
        },
        institutions: {
          total: totalInstitutions,
          verified: verifiedInstitutions,
          pendingVerification: pendingInstitutions
        },
        payments: {
          pending: pendingPayments,
          verified: verifiedPayments,
          byStatus: paymentsByStatus
        },
        recentApplications
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['student', 'admin', 'company'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Get detailed opportunity information
// @route   GET /api/admin/opportunities/:id
// @access  Private/Admin
exports.getOpportunityDetail = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('postedBy', 'firstName lastName email company');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      });
    }

    // Get applications for this opportunity
    const applications = await Application.find({ opportunity: req.params.id })
      .populate('applicant', 'firstName lastName email')
      .select('firstName lastName email status submittedAt')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      opportunity: {
        ...opportunity.toObject(),
        applicationCount: applications.length,
        applications
      }
    });
  } catch (error) {
    console.error('Get opportunity detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching opportunity details',
      error: error.message
    });
  }
};

// @desc    Get application with all documents
// @route   GET /api/admin/applications/:id/full
// @access  Private/Admin
exports.getApplicationFull = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'firstName lastName email phoneNumber')
      .populate('opportunity', 'title companyName email')
      .populate('reviewedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get payment info if exists
    const payment = await Payment.findOne({ application: req.params.id });

    res.status(200).json({
      success: true,
      application,
      payment
    });
  } catch (error) {
    console.error('Get application full error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application details',
      error: error.message
    });
  }
};

// @desc    Get system logs/audit trail (simplified)
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getSystemLogs = async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;

    // This is a simplified implementation
    // In production, you'd want a dedicated Logs collection
    let logs = [];

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Collect recent activities from different models
    const recentPayments = await Payment.find()
      .select('status createdAt mpesaCode -_id')
      .lean()
      .limit(25);

    const recentApplications = await Application.find()
      .select('status submittedAt -_id')
      .lean()
      .limit(25);

    logs = [
      ...recentPayments.map(p => ({
        type: 'payment',
        action: `Payment ${p.status}`,
        code: p.mpesaCode,
        timestamp: p.createdAt
      })),
      ...recentApplications.map(a => ({
        type: 'application',
        action: `Application ${a.status}`,
        timestamp: a.submittedAt || new Date()
      }))
    ];

    logs = logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limitNum);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system logs',
      error: error.message
    });
  }
};

// @desc    Generate report (applications, payments, etc.)
// @route   GET /api/admin/reports/:type
// @access  Private/Admin
exports.generateReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let report = {};

    switch (type) {
      case 'applications':
        report = await Application.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]);
        break;

      case 'payments':
        report = await Payment.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' }
            }
          },
          { $sort: { totalAmount: -1 } }
        ]);
        break;

      case 'institutions':
        report = await Institution.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]);
        break;

      case 'users':
        report = await User.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.status(200).json({
      success: true,
      reportType: type,
      data: report,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};
