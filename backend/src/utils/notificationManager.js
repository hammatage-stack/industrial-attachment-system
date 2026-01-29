const Notification = require('../models/Notification');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const emailService = require('./emailService');
const smsService = require('./smsService');
const logger = require('./logger');

/**
 * Notification Manager
 * Handles all in-app, email, and SMS notifications
 */
class NotificationManager {
  /**
   * Create in-app notification
   */
  async createNotification(userId, type, title, message, data = null) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        data
      });

      logger.info(`Notification created for user ${userId}`);
      return notification;
    } catch (error) {
      logger.error('Notification creation error:', error);
      throw error;
    }
  }

  /**
   * Notify application submission
   */
  async notifyApplicationSubmission(application) {
    try {
      const user = application.user;

      // Create in-app notification
      await this.createNotification(
        user._id,
        'application_status',
        'Application Submitted',
        'Your application has been submitted successfully',
        { applicationId: application._id }
      );

      // Send email
      await emailService.sendApplicationSubmissionConfirmation(user.email, {
        opportunityTitle: application.opportunity.title,
        referenceNumber: application._id
      });

      // Send SMS
      if (user.phoneNumber) {
        await smsService.sendApplicationStatusSMS(
          user.phoneNumber,
          'submitted',
          application.opportunity.title
        );
      }

      logger.info(`Application submission notifications sent for ${user.email}`);
    } catch (error) {
      logger.error('Application submission notification error:', error);
    }
  }

  /**
   * Notify payment status
   */
  async notifyPaymentStatus(payment, status) {
    try {
      const application = await Application.findById(payment.application).populate('user');
      const user = application.user;

      const messages = {
        'pending': 'Your payment is pending verification',
        'verified': 'Your payment has been verified! You can now complete your application',
        'rejected': 'Your payment could not be verified. Please resubmit',
        'duplicate': 'Your payment code appears to be a duplicate'
      };

      // Create in-app notification
      await this.createNotification(
        user._id,
        'payment_status',
        `Payment ${status}`,
        messages[status],
        { paymentId: payment._id, status }
      );

      // Send email
      if (status === 'verified') {
        await emailService.sendPaymentVerifiedNotification(user.email, {
          mpesaCode: payment.mpesaCode,
          amount: payment.amount
        });
      } else if (status === 'rejected') {
        await emailService.sendPaymentRejectionNotification(user.email, {
          reason: payment.rejectionReason
        });
      }

      // Send SMS
      if (user.phoneNumber) {
        if (status === 'verified') {
          await smsService.sendPaymentVerifiedSMS(user.phoneNumber, payment.mpesaCode);
        } else if (status === 'rejected') {
          await smsService.sendPaymentRejectionSMS(user.phoneNumber, payment.rejectionReason);
        }
      }

      logger.info(`Payment status notification sent for ${user.email}`);
    } catch (error) {
      logger.error('Payment notification error:', error);
    }
  }

  /**
   * Notify application status change
   */
  async notifyApplicationStatus(application, newStatus) {
    try {
      const user = application.user;

      const titles = {
        'under-review': 'Application Under Review',
        'accepted': 'Application Accepted!',
        'rejected': 'Application Status Update'
      };

      const messages = {
        'under-review': 'Your application is being reviewed by our team',
        'accepted': 'Congratulations! Your application has been accepted!',
        'rejected': 'Your application was not selected'
      };

      // Create in-app notification
      await this.createNotification(
        user._id,
        'application_status',
        titles[newStatus],
        messages[newStatus],
        { applicationId: application._id, status: newStatus }
      );

      // Send email
      await emailService.sendApplicationStatusUpdate(user.email, {
        status: newStatus,
        opportunityTitle: application.opportunity.title
      });

      // Send SMS
      if (user.phoneNumber) {
        await smsService.sendApplicationStatusSMS(
          user.phoneNumber,
          newStatus,
          application.opportunity.title
        );
      }

      logger.info(`Application status notification sent for ${user.email}`);
    } catch (error) {
      logger.error('Application status notification error:', error);
    }
  }

  /**
   * Notify interview scheduled
   */
  async notifyInterviewScheduled(schedule) {
    try {
      const user = schedule.student;

      await this.createNotification(
        user._id,
        'interview_scheduled',
        'Interview Scheduled',
        `Interview scheduled for ${new Date(schedule.scheduledDate).toLocaleDateString()}`,
        { scheduleId: schedule._id }
      );

      // Send email with details
      // This would call emailService.sendInterviewScheduledEmail

      logger.info(`Interview notification sent to user ${user._id}`);
    } catch (error) {
      logger.error('Interview notification error:', error);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, read = null, page = 1, limit = 20) {
    try {
      const query = { user: userId };
      if (read !== null) {
        query.read = read;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      logger.error('Get notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await Notification.findByIdAndUpdate(
        notificationId,
        {
          read: true,
          readAt: new Date()
        }
      );

      logger.info(`Notification ${notificationId} marked as read`);
    } catch (error) {
      logger.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user: userId, read: false },
        {
          read: true,
          readAt: new Date()
        }
      );

      logger.info(`${result.modifiedCount} notifications marked as read for user ${userId}`);
      return result;
    } catch (error) {
      logger.error('Mark all as read error:', error);
      throw error;
    }
  }

  /**
   * Delete old notifications
   */
  async deleteOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      logger.info(`Deleted ${result.deletedCount} notifications older than ${daysOld} days`);
      return result;
    } catch (error) {
      logger.error('Delete old notifications error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationManager();
