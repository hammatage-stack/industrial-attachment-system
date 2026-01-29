const CompanyPortal = require('../models/CompanyPortal');
const Institution = require('../models/Institution');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const logger = require('../utils/logger');

/**
 * Company Portal Controller
 * Manages company/institution portals
 */
exports.createCompanyPortal = async (req, res) => {
  try {
    const { institutionId, role } = req.body;

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution not found'
      });
    }

    // Check if portal already exists
    const existingPortal = await CompanyPortal.findOne({
      user: req.user.id,
      institution: institutionId
    });

    if (existingPortal) {
      return res.status(400).json({
        success: false,
        message: 'Portal already exists for this institution'
      });
    }

    const portal = await CompanyPortal.create({
      user: req.user.id,
      institution: institutionId,
      role: role || 'recruiter'
    });

    logger.info(`Company portal created for user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Company portal created successfully',
      portal
    });
  } catch (error) {
    logger.error('Company portal creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company portal',
      error: error.message
    });
  }
};

/**
 * Get company portal
 */
exports.getCompanyPortal = async (req, res) => {
  try {
    const portal = await CompanyPortal.findById(req.params.portalId)
      .populate('user', 'firstName lastName email')
      .populate('institution')
      .populate('activeOpportunities', 'title status applicants');

    if (!portal) {
      return res.status(404).json({
        success: false,
        message: 'Portal not found'
      });
    }

    res.status(200).json({
      success: true,
      portal
    });
  } catch (error) {
    logger.error('Get portal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portal',
      error: error.message
    });
  }
};

/**
 * Get portal statistics
 */
exports.getPortalStats = async (req, res) => {
  try {
    const { portalId } = req.params;

    const portal = await CompanyPortal.findById(portalId);
    if (!portal) {
      return res.status(404).json({
        success: false,
        message: 'Portal not found'
      });
    }

    const opportunities = await Opportunity.find({
      _id: { $in: portal.activeOpportunities }
    });

    const totalApplied = opportunities.reduce((sum, opp) => sum + opp.applicants, 0);

    const stats = {
      opportunitiesPosted: portal.stats.opportunitiesPosted,
      applicationsReceived: totalApplied,
      interviewsScheduled: portal.stats.interviewsScheduled,
      offersExtended: portal.stats.offersExtended,
      conversionRate: totalApplied > 0
        ? ((portal.stats.offersExtended / totalApplied) * 100).toFixed(2) + '%'
        : '0%'
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Get portal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portal statistics',
      error: error.message
    });
  }
};

/**
 * Get portal applications
 */
exports.getPortalApplications = async (req, res) => {
  try {
    const { portalId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const portal = await CompanyPortal.findById(portalId);
    if (!portal) {
      return res.status(404).json({
        success: false,
        message: 'Portal not found'
      });
    }

    const query = {
      opportunity: { $in: portal.activeOpportunities }
    };

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('user', 'firstName lastName email phoneNumber')
      .populate('opportunity', 'title')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      applications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    logger.error('Get portal applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

/**
 * Add team member to portal
 */
exports.addTeamMember = async (req, res) => {
  try {
    const { portalId } = req.params;
    const { userId, role } = req.body;

    const portal = await CompanyPortal.findByIdAndUpdate(
      portalId,
      {
        $push: {
          team: {
            user: userId,
            role
          }
        }
      },
      { new: true }
    );

    logger.info(`Team member added to portal ${portalId}`);

    res.status(200).json({
      success: true,
      message: 'Team member added',
      portal
    });
  } catch (error) {
    logger.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add team member',
      error: error.message
    });
  }
};

/**
 * Remove team member from portal
 */
exports.removeTeamMember = async (req, res) => {
  try {
    const { portalId, memberId } = req.params;

    const portal = await CompanyPortal.findByIdAndUpdate(
      portalId,
      {
        $pull: {
          team: { _id: memberId }
        }
      },
      { new: true }
    );

    logger.info(`Team member removed from portal ${portalId}`);

    res.status(200).json({
      success: true,
      message: 'Team member removed',
      portal
    });
  } catch (error) {
    logger.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove team member',
      error: error.message
    });
  }
};
