const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('./logger');

/**
 * Enhanced Email Service with Additional Templates
 */
class EnhancedEmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }

  /**
   * Send OTP via email for 2FA
   */
  async sendOTPEmail(email, otp) {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Identity</h2>
        <p>Your Industrial Attachment System verification code is:</p>
        <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
        <p style="color: #666;">This code expires in 10 minutes. Do not share this code with anyone.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail(email, 'Industrial Attachment System - Verification Code', htmlTemplate);
  }

  /**
   * Send interview scheduled email
   */
  async sendInterviewScheduledEmail(email, details) {
    const dateStr = new Date(details.date).toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Interview Scheduled</h2>
        <p>Great news! An interview has been scheduled for you.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
          <p><strong>Interview Type:</strong> ${details.type}</p>
          <p><strong>Date & Time:</strong> ${dateStr}</p>
          <p><strong>Duration:</strong> ${details.duration} minutes</p>
          <p><strong>Location/Link:</strong> ${details.location}</p>
        </div>
        <p>Please ensure you are available at the scheduled time. If you need to reschedule, contact us as soon as possible.</p>
        <p>Good luck!</p>
      </div>
    `;

    return this.sendEmail(email, 'Interview Scheduled - Industrial Attachment System', htmlTemplate);
  }

  /**
   * Send interview rescheduled email
   */
  async sendInterviewRescheduledEmail(email, details) {
    const dateStr = new Date(details.newDate).toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Interview Rescheduled</h2>
        <p>Your interview has been rescheduled to:</p>
        <h3 style="color: #007bff;">${dateStr}</h3>
        <p><strong>Reason:</strong> ${details.reason}</p>
        <p>Please update your calendar accordingly. If you have any concerns, please contact us.</p>
      </div>
    `;

    return this.sendEmail(email, 'Interview Rescheduled - Industrial Attachment System', htmlTemplate);
  }

  /**
   * Send interview cancelled email
   */
  async sendInterviewCancelledEmail(email, details) {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Interview Cancelled</h2>
        <p>Your scheduled interview has been cancelled.</p>
        <p><strong>Reason:</strong> ${details.reason || 'Not specified'}</p>
        <p>We apologize for any inconvenience. Please contact us if you have any questions.</p>
      </div>
    `;

    return this.sendEmail(email, 'Interview Cancelled - Industrial Attachment System', htmlTemplate);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetLink) {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetLink}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p style="color: #666;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        <p>Or copy this link: <code>${resetLink}</code></p>
      </div>
    `;

    return this.sendEmail(email, 'Password Reset - Industrial Attachment System', htmlTemplate);
  }

  /**
   * Send bulk notification email
   */
  async sendBulkNotification(emails, subject, htmlContent) {
    try {
      const results = [];

      for (const email of emails) {
        try {
          const result = await this.sendEmail(email, subject, htmlContent);
          results.push({ email, success: true });
        } catch (error) {
          logger.error(`Failed to send to ${email}:`, error);
          results.push({ email, success: false, error: error.message });
        }
      }

      logger.info(`Bulk notification sent. Success: ${results.filter(r => r.success).length}/${results.length}`);
      return results;
    } catch (error) {
      logger.error('Bulk notification error:', error);
      throw error;
    }
  }

  /**
   * Generic email sender
   */
  async sendEmail(to, subject, htmlContent) {
    try {
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}`);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error(`Email sending failed to ${to}:`, error);
      throw error;
    }
  }
}

module.exports = new EnhancedEmailService();
