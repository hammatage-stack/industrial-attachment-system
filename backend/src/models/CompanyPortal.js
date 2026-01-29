const mongoose = require('mongoose');

/**
 * Company Portal Schema
 * Allows companies/institutions to post opportunities and manage applications
 */
const companyPortalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  role: {
    type: String,
    enum: ['hr_manager', 'recruiter', 'admin'],
    required: true,
    default: 'recruiter'
  },
  permissions: {
    canPostOpportunities: {
      type: Boolean,
      default: true
    },
    canViewApplications: {
      type: Boolean,
      default: true
    },
    canScheduleInterviews: {
      type: Boolean,
      default: true
    },
    canApproveApplications: {
      type: Boolean,
      default: false
    },
    canManageTeam: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    opportunitiesPosted: {
      type: Number,
      default: 0
    },
    applicationsReceived: {
      type: Number,
      default: 0
    },
    interviewsScheduled: {
      type: Number,
      default: 0
    },
    offersExtended: {
      type: Number,
      default: 0
    }
  },
  activeOpportunities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  }],
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for company queries
companyPortalSchema.index({ user: 1 });
companyPortalSchema.index({ institution: 1 });
companyPortalSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('CompanyPortal', companyPortalSchema);
