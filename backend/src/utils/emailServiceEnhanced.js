const config = require('../config/config');
const { enqueueEmail } = require('../queues/emailQueue');

/**
 * Enhanced Email Service with Provider Support
 * Supports: Gmail, Zoho, SendGrid, and Custom SMTP
 * Falls back to mock mode in development without credentials
 */
class EmailServiceEnhanced {
  constructor() {
    this.transporter = null;
    this.isDevelopment = config.nodeEnv === 'development';
    this.emailLog = [];
    this.provider = config.email.provider || 'gmail';
    this.initializeTransporter();
  }

  /**
   * Initialize transporter based on configured provider
   */
  initializeTransporter() {
    try {
      const nodemailer = require('nodemailer');
      let transportConfig = null;

      switch (this.provider) {
        case 'gmail':
          transportConfig = this.getGmailConfig();
          break;
        case 'zoho':
          transportConfig = this.getZohoConfig();
          break;
        case 'sendgrid':
          transportConfig = this.getSendGridConfig();
          break;
        case 'custom':
        default:
          transportConfig = this.getCustomSMTPConfig();
      }

      if (transportConfig) {
        this.transporter = nodemailer.createTransport(transportConfig);

        // Verify connection
        this.transporter.verify((error, success) => {
          if (error) {
            console.warn(`⚠️  Email ${this.provider} not fully configured. Using mock email mode for development.`);
            this.transporter = null;
          } else {
            console.log(`✅ Email service connected to ${this.provider.toUpperCase()} SMTP`);
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

  /**
   * Get Gmail SMTP Configuration
   */
  getGmailConfig() {
    const { user, password, gmail } = config.email;
    
    // Prefer app-specific password if available
    const emailPassword = gmail?.appPassword || password;

    if (!user || !emailPassword) {
      console.warn('Gmail credentials not configured. Set EMAIL_USER and GMAIL_APP_PASSWORD or EMAIL_PASSWORD');
      return null;
    }

    return {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: user,
        pass: emailPassword
      }
    };
  }

  /**
   * Get Zoho SMTP Configuration
   */
  getZohoConfig() {
    const { user, password, zoho } = config.email;
    const region = zoho?.region || 'com';

    if (!user || !password) {
      console.warn('Zoho credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD');
      return null;
    }

    return {
      host: `smtp.zoho.${region}`,
      port: 587,
      secure: false,
      auth: {
        user: user,
        pass: password
      }
    };
  }

  /**
   * Get SendGrid Configuration
   * SendGrid uses API key authentication via nodemailer-sendgrid
   */
  getSendGridConfig() {
    const { sendgrid } = config.email;
    const apiKey = sendgrid?.apiKey;

    if (!apiKey) {
      console.warn('SendGrid API key not configured. Set SENDGRID_API_KEY');
      return null;
    }

    // Note: This requires nodemailer-sendgrid plugin
    // For now, we'll use SMTP relay if available
    console.warn('SendGrid direct API support requires nodemailer-sendgrid plugin. Using fallback.');
    return this.getCustomSMTPConfig();
  }

  /**
   * Get Custom SMTP Configuration
   */
  getCustomSMTPConfig() {
    const { host, port, user, password } = config.email;

    if (!host || !user || !password) {
      console.warn('Custom SMTP credentials not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD');
      return null;
    }

    return {
      host: host,
      port: port || 587,
      secure: (port || 587) === 465,
      auth: {
        user: user,
        pass: password
      }
    };
  }

  /**
   * Send email using configured provider
   */
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
          console.log(`✅ Email sent to ${to} via ${this.provider.toUpperCase()}`);
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
            messageId: `mock-${Date.now()}`,
            provider: this.provider
          };
          this.emailLog.push(mockEmail);
          console.log(`📧 [MOCK EMAIL - ${this.provider.toUpperCase()}] To: ${to}\n   Subject: ${subject}`);
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

  /**
   * Get provider health status
   */
  async getProviderStatus() {
    return {
      provider: this.provider,
      configured: this.transporter !== null,
      isDevelopment: this.isDevelopment,
      mockLogsCount: this.emailLog.length
    };
  }

  // Email Template Methods (same as original)
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
        <h2 style="color: ${statusColorMap[newStatus] || '#333'};">📋 Application Status Update</h2>
        <p>Dear ${applicantName},</p>
        <p>Your application status for <strong>${opportunityTitle}</strong> has been updated.</p>
        <p><strong>New Status:</strong> <span style="color: ${statusColorMap[newStatus] || '#333'}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
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

  // Development helpers
  getMockEmailLog() {
    return this.emailLog;
  }

  clearMockEmailLog() {
    this.emailLog = [];
  }
}

// Export singleton instance
module.exports = new EmailServiceEnhanced();
