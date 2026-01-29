const config = require('../config/config');
const { enqueueEmail } = require('../queues/emailQueue');

/**
 * Email Service with Development Mode
 * In development, emails are logged to console instead of actually sent
 * In production, requires proper SMTP credentials in .env
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isDevelopment = config.nodeEnv === 'development';
    this.emailLog = [];
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Only initialize real transporter if all credentials are set
      if (config.email.host && config.email.user && config.email.password) {
        const nodemailer = require('nodemailer');
        this.transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port,
          secure: config.email.port === 465,
          auth: {
            user: config.email.user,
            pass: config.email.password
          }
        });

        this.transporter.verify((error, success) => {
          if (error) {
            console.warn('⚠️  Email SMTP not configured. Using mock email mode for development.');
            this.transporter = null;
          } else {
            console.log('✅ Email service connected to SMTP');
          }
        });
      } else {
        if (this.isDevelopment) {
          console.log('ℹ️  Email credentials not set. Using mock email mode (emails logged to console).');
        } else {
          console.warn('⚠️  Production mode but email credentials not configured!');
        }
      }
    } catch (error) {
      console.warn('⚠️  Email service initialization failed. Using mock mode:', error.message);
    }
  }

  async sendEmail(to, subject, html) {
    try {
      if (this.transporter) {
        try {
          const result = await this.transporter.sendMail({
            from: config.email.from,
            to,
            subject,
            html
          });
          console.log(`✅ Email sent to ${to}`);
          return result;
        } catch (sendErr) {
          console.error('❌ Immediate send failed, enqueuing for retry:', sendErr.message || sendErr);
          // Enqueue for background retries
          try {
            await enqueueEmail(to, subject, html);
            console.log(`🔁 Email enqueued for retry to ${to}`);
            return { queued: true };
          } catch (enqueueErr) {
            console.error('❌ Failed to enqueue email:', enqueueErr.message || enqueueErr);
            throw enqueueErr;
          }
        }
      } else {
        // Mock email in development
        if (this.isDevelopment) {
          const mockEmail = {
            timestamp: new Date(),
            to,
            subject,
            html,
            messageId: `mock-${Date.now()}`
          };
          this.emailLog.push(mockEmail);
          console.log(`📧 [MOCK EMAIL] To: ${to}\n   Subject: ${subject}`);
          return mockEmail;
        }
        // If production but transporter not configured, try to enqueue anyway
        try {
          await enqueueEmail(to, subject, html);
          console.log(`🔁 Email enqueued for retry (no transporter) to ${to}`);
          return { queued: true };
        } catch (enqueueErr) {
          console.error('❌ Failed to enqueue email (no transporter):', enqueueErr.message || enqueueErr);
          throw new Error('Email service not configured and enqueue failed');
        }
      }
    } catch (error) {
      console.error('❌ Error handling email send:', error.message || error);
      if (!this.isDevelopment) throw error;
      return { error: error.message, status: 'failed' };
    }
  }

  async sendApplicationSubmissionConfirmation(recipientEmail, applicantName, opportunityTitle) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">✅ Application Submission Confirmed</h2>
        <p>Dear ${applicantName},</p>
        <p>Your application for the <strong>${opportunityTitle}</strong> opportunity has been successfully received.</p>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>An admin will verify your M-Pesa payment</li>
          <li>Once verified, your application will be forwarded to the organization</li>
          <li>You will receive further updates via email</li>
        </ol>
        <p>Thank you for applying!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Industrial Attachment System</p>
      </div>
    `;
    return this.sendEmail(recipientEmail, 'Application Submission Confirmed - Industrial Attachment System', html);
  }

  async sendPaymentConfirmation(recipientEmail, applicantName, mpesaCode, amount) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">💰 Payment Received</h2>
        <p>Dear ${applicantName},</p>
        <p>We have received your M-Pesa payment for your application.</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Transaction Code: <strong>${mpesaCode}</strong></li>
          <li>Amount: <strong>KES ${amount}</strong></li>
        </ul>
        <p>Our admin team will verify your payment shortly. You will receive a confirmation email once the verification is complete.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Industrial Attachment System</p>
      </div>
    `;
    return this.sendEmail(recipientEmail, 'Payment Received - Industrial Attachment System', html);
  }

  async sendPaymentVerifiedNotification(recipientEmail, applicantName, opportunityTitle) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">✅ Payment Verified</h2>
        <p>Dear ${applicantName},</p>
        <p>Your M-Pesa payment has been successfully verified!</p>
        <p>Your application for <strong>${opportunityTitle}</strong> has been officially submitted to the organization.</p>
        <p><strong>What Next?</strong></p>
        <ul>
          <li>The organization will review your application</li>
          <li>You will be notified of any updates via email</li>
          <li>Check the IAS portal for status updates</li>
        </ul>
        <p>Thank you for using the Industrial Attachment System.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Industrial Attachment System</p>
      </div>
    `;
    return this.sendEmail(recipientEmail, 'Payment Verified - Application Submitted', html);
  }

  async sendPaymentRejectionNotification(recipientEmail, applicantName, rejectionReason) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">❌ Payment Verification Failed</h2>
        <p>Dear ${applicantName},</p>
        <p>Unfortunately, your M-Pesa payment could not be verified.</p>
        <p><strong>Reason:</strong> ${rejectionReason}</p>
        <p><strong>What You Can Do:</strong></p>
        <ul>
          <li>Double-check your M-Pesa transaction code</li>
          <li>Ensure you sent KES 500 to the correct account</li>
          <li>Try submitting your payment again with the correct details</li>
        </ul>
        <p>If you continue to experience issues, please contact our support team.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Industrial Attachment System</p>
      </div>
    `;
    return this.sendEmail(recipientEmail, 'Payment Verification Failed', html);
  }

  async sendAdminPaymentNotification(adminEmail, applicantName, mpesaCode, amount) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff9800;">🔔 New Payment for Verification</h2>
        <p>A new application payment has been submitted and requires verification.</p>
        <p><strong>Applicant:</strong> ${applicantName}</p>
        <p><strong>M-Pesa Code:</strong> <code style="background: #f0f0f0; padding: 5px;">${mpesaCode}</code></p>
        <p><strong>Amount:</strong> KES ${amount}</p>
        <p><strong>Action Required:</strong> Please verify this payment in the admin dashboard and either approve or reject it.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Industrial Attachment System - Admin Alert</p>
      </div>
    `;
    return this.sendEmail(adminEmail, '[ADMIN] New Payment Requires Verification', html);
  }

  async sendApplicationStatusUpdate(recipientEmail, applicantName, opportunityTitle, newStatus, message = '') {
    const statusColorMap = {
      'submitted': '#007bff',
      'under-review': '#ffc107',
      'shortlisted': '#28a745',
      'accepted': '#17a2b8',
      'rejected': '#dc3545'
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColorMap[newStatus]};">📋 Application Status Update</h2>
        <p>Dear ${applicantName},</p>
        <p>Your application status for <strong>${opportunityTitle}</strong> has been updated.</p>
        <p><strong>New Status:</strong> <span style="color: ${statusColorMap[newStatus]}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        <p>Log in to the IAS portal to view more details about your application.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Industrial Attachment System</p>
      </div>
    `;
    return this.sendEmail(recipientEmail, `Application Status Update - ${newStatus.toUpperCase()}`, html);
  }

  async sendPasswordResetEmail(recipientEmail, resetLink) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">🔐 Password Reset Request</h2>
        <p>You have requested a password reset for your Industrial Attachment System account.</p>
        <p><strong>Click the link below to reset your password:</strong></p>
        <p><a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">Industrial Attachment System</p>
      </div>
    `;
    return this.sendEmail(recipientEmail, 'Password Reset Request', html);
  }

  // Development helper: get mock emails
  getMockEmailLog() {
    return this.emailLog;
  }

  // Development helper: clear mock emails
  clearMockEmailLog() {
    this.emailLog = [];
  }
}

// Export singleton instance
module.exports = new EmailService();
