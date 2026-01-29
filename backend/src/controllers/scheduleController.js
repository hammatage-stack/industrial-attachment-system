const Schedule = require('../models/Schedule');
const Application = require('../models/Application');
const emailService = require('../utils/emailServiceEnhanced');
const logger = require('../utils/logger');

/**
 * Schedule Controller
 * Manages interview scheduling
 */
exports.scheduleInterview = async (req, res) => {
  try {
    const {
      applicationId,
      type,
      scheduledDate,
      duration,
      location,
      meetingLink,
      notes
    } = req.body;

    const application = await Application.findById(applicationId).populate('user');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Validate date
    if (new Date(scheduledDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule interview in the past'
      });
    }

    const schedule = await Schedule.create({
      application: applicationId,
      student: application.user._id,
      interviewer: req.user.id,
      opportunity: application.opportunity,
      type,
      scheduledDate,
      duration: duration || 30,
      location: type === 'in-person' ? location : null,
      meetingLink: type === 'video' ? meetingLink : null,
      notes: {
        interviewer: notes
      }
    });

    // Send notification to student
    await emailService.sendInterviewScheduledEmail(
      application.user.email,
      {
        type,
        date: new Date(scheduledDate),
        duration,
        location: location || meetingLink
      }
    );

    logger.info(`Interview scheduled for application ${applicationId}`);

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      schedule
    });
  } catch (error) {
    logger.error('Interview scheduling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
};

/**
 * Get scheduled interviews for user
 */
exports.getMyInterviews = async (req, res) => {
  try {
    const interviews = await Schedule.find({
      student: req.user.id,
      status: { $ne: 'cancelled' }
    })
      .populate('opportunity', 'title company')
      .populate('interviewer', 'firstName lastName email')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      interviews
    });
  } catch (error) {
    logger.error('Get interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews',
      error: error.message
    });
  }
};

/**
 * Get interview details
 */
exports.getInterviewDetails = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findById(scheduleId)
      .populate('student', 'firstName lastName email phoneNumber')
      .populate('interviewer', 'firstName lastName email')
      .populate('application')
      .populate('opportunity', 'title company');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.status(200).json({
      success: true,
      schedule
    });
  } catch (error) {
    logger.error('Get interview details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview details',
      error: error.message
    });
  }
};

/**
 * Reschedule interview
 */
exports.rescheduleInterview = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { newDate, reason } = req.body;

    if (new Date(newDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule interview in the past'
      });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      {
        scheduledDate: newDate,
        status: 'rescheduled'
      },
      { new: true }
    ).populate('student', 'email');

    // Notify student
    await emailService.sendInterviewRescheduledEmail(
      schedule.student.email,
      {
        newDate: new Date(newDate),
        reason
      }
    );

    logger.info(`Interview ${scheduleId} rescheduled`);

    res.status(200).json({
      success: true,
      message: 'Interview rescheduled successfully',
      schedule
    });
  } catch (error) {
    logger.error('Reschedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule interview',
      error: error.message
    });
  }
};

/**
 * Complete interview with feedback
 */
exports.completeInterview = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { outcome, rating, feedback } = req.body;

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      {
        status: 'completed',
        'result.outcome': outcome,
        'result.rating': rating,
        'result.feedback': feedback,
        'result.completedAt': new Date()
      },
      { new: true }
    );

    logger.info(`Interview ${scheduleId} completed`);

    res.status(200).json({
      success: true,
      message: 'Interview completed',
      schedule
    });
  } catch (error) {
    logger.error('Complete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete interview',
      error: error.message
    });
  }
};

/**
 * Cancel interview
 */
exports.cancelInterview = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { reason } = req.body;

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      {
        status: 'cancelled',
        'notes.cancellation': reason
      },
      { new: true }
    ).populate('student', 'email');

    // Notify student
    await emailService.sendInterviewCancelledEmail(
      schedule.student.email,
      { reason }
    );

    logger.info(`Interview ${scheduleId} cancelled`);

    res.status(200).json({
      success: true,
      message: 'Interview cancelled',
      schedule
    });
  } catch (error) {
    logger.error('Cancel interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel interview',
      error: error.message
    });
  }
};
