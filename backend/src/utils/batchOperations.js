const Application = require('../models/Application');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const logger = require('./logger');

/**
 * Batch Operations Service
 * Handles bulk operations on applications and other entities
 */
class BatchOperations {
  /**
   * Batch update application status
   */
  async batchUpdateApplicationStatus(applicationIds, newStatus, adminId) {
    try {
      const result = await Application.updateMany(
        { _id: { $in: applicationIds } },
        {
          status: newStatus,
          'timeline.lastUpdated': new Date(),
          'timeline.updatedBy': adminId
        }
      );

      // Create notifications for affected users
      const applications = await Application.find({ _id: { $in: applicationIds } });
      await this.createBatchNotifications(
        applications.map(app => app.user),
        `Your application status has been updated to: ${newStatus}`,
        'application_status'
      );

      logger.info(`Batch updated ${result.modifiedCount} applications to ${newStatus}`);
      return result;
    } catch (error) {
      logger.error('Batch update error:', error);
      throw error;
    }
  }

  /**
   * Batch verify payments
   */
  async batchVerifyPayments(paymentIds, adminId) {
    try {
      const result = await Payment.updateMany(
        { _id: { $in: paymentIds }, status: 'pending' },
        {
          status: 'verified',
          verificationBy: adminId,
          verificationDate: new Date()
        }
      );

      // Update related applications
      const payments = await Payment.find({ _id: { $in: paymentIds } });
      const applicationIds = payments.map(p => p.application);

      await Application.updateMany(
        { _id: { $in: applicationIds } },
        { 'payment.status': 'verified' }
      );

      logger.info(`Batch verified ${result.modifiedCount} payments`);
      return result;
    } catch (error) {
      logger.error('Batch verify payments error:', error);
      throw error;
    }
  }

  /**
   * Batch reject applications
   */
  async batchRejectApplications(applicationIds, reason, adminId) {
    try {
      const result = await Application.updateMany(
        { _id: { $in: applicationIds } },
        {
          status: 'rejected',
          rejectionReason: reason,
          rejectionDate: new Date(),
          rejectionBy: adminId
        }
      );

      // Create notifications
      const applications = await Application.find({ _id: { $in: applicationIds } });
      await this.createBatchNotifications(
        applications.map(app => app.user),
        `Your application was not selected. Reason: ${reason}`,
        'application_status'
      );

      logger.info(`Batch rejected ${result.modifiedCount} applications`);
      return result;
    } catch (error) {
      logger.error('Batch reject error:', error);
      throw error;
    }
  }

  /**
   * Batch create notifications
   */
  async createBatchNotifications(userIds, message, type) {
    try {
      const notifications = userIds.map(userId => ({
        user: userId,
        type,
        title: 'Status Update',
        message,
        read: false
      }));

      const result = await Notification.insertMany(notifications);
      logger.info(`Created ${result.length} batch notifications`);
      return result;
    } catch (error) {
      logger.error('Batch notification creation error:', error);
      throw error;
    }
  }

  /**
   * Batch export applications
   */
  async batchExportApplications(applicationIds, format = 'csv') {
    try {
      const applications = await Application.find({ _id: { $in: applicationIds } })
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('opportunity', 'title');

      if (format === 'csv') {
        return this.convertToCSV(applications);
      } else if (format === 'json') {
        return applications;
      } else {
        throw new Error('Unsupported format');
      }
    } catch (error) {
      logger.error('Batch export error:', error);
      throw error;
    }
  }

  /**
   * Convert applications to CSV format
   */
  convertToCSV(applications) {
    const headers = [
      'Application ID',
      'Student Name',
      'Email',
      'Phone',
      'Opportunity',
      'Status',
      'Submitted At'
    ];

    const rows = applications.map(app => [
      app._id,
      `${app.user.firstName} ${app.user.lastName}`,
      app.user.email,
      app.user.phoneNumber,
      app.opportunity.title,
      app.status,
      new Date(app.createdAt).toLocaleDateString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Batch schedule interviews
   */
  async batchScheduleInterviews(applicationIds, scheduleData) {
    try {
      const Schedule = require('../models/Schedule');
      const schedules = [];

      for (const appId of applicationIds) {
        const schedule = {
          application: appId,
          ...scheduleData
        };
        schedules.push(schedule);
      }

      const result = await Schedule.insertMany(schedules);
      logger.info(`Batch scheduled ${result.length} interviews`);
      return result;
    } catch (error) {
      logger.error('Batch schedule error:', error);
      throw error;
    }
  }

  /**
   * Get batch operation status
   */
  async getBatchStatus(batchId) {
    // This would track batch operations in progress
    return {
      batchId,
      status: 'completed',
      processed: 100,
      successful: 95,
      failed: 5
    };
  }
}

module.exports = new BatchOperations();
