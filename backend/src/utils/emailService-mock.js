const config = require('../config/config');

/**
 * Mock Email Service for Development
 * In production, this will use real SMTP
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
    this.isDevelopment = config.nodeEnv === 'development';
    this.emailLog = []; // Store emails sent in development
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
            console.warn('⚠️  Email service not fully configured. Using mock mode.');
            this.transporter = null;
          } else {
            console.log('✅ Email service connected');
          }
        });
      } else {
        console.log('ℹ️  Email credentials not configured. Using mock email mode.');
      }
    } catch (error) {
      console.warn('⚠️  Email service initialization failed. Using mock mode:', error.message);
      this.transporter = null;
    }
  }

  async sendEmail(mailOptions) {
    try {
      if (this.transporter) {
        // Send real email
        return await this.transporter.sendMail(mailOptions);
      } else {
        // Mock email for development
        if (this.isDevelopment) {
          this.emailLog.push({
            timestamp: new Date(),
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html
          });
          console.log(`📧 [MOCK EMAIL] To: ${mailOptions.to}\n   Subject: ${mailOptions.subject}`);
          return { messageId: `mock-${Date.now()}`, status: 'sent-mock' };
        }
        throw new Error('Email service not configured and not in development mode');
      }
    } catch (error) {
      console.error('Error sending email:', error.message);
      // Don't throw in development, just log
      if (this.isDevelopment) {
        return { messageId: `mock-error-${Date.now()}`, status: 'error', error: error.message };
      }
      throw error;
    }
  }

  async sendApplicationSubmissionConfirmation(recipientEmail, applicantName, opportunityTitle) {
    const mailOptions = {
      from: config.email.from,
      to: recipientEmail,
      subject: 'Application Submission Confirmed - Industrial Attachment System',
      html: `
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
      `
    };
    return this.sendEmail(mailOptions);
  }

  async sendPaymentVerificationNotification(recipientEmail, applicantName, paymentStatus) {
    const statusMessage = paymentStatus === 'verified' 
      ? 'Your payment has been verified and your application is now being processed.'
      : 'There was an issue with your payment verification. Please contact support.';
    
    const mailOptions = {
      from: config.email.from,
      to: recipientEmail,
      subject: `Payment ${paymentStatus.toUpperCase()} - Industrial Attachment System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${paymentStatus === 'verified' ? '#27ae60' : '#e74c3c'};">Payment ${paymentStatus.toUpperCase()}</h2>
          <p>Dear ${applicantName},</p>
          <p>${statusMessage}</p>
          <p>If you have any questions, please contact our support team.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Industrial Attachment System</p>
        </div>
      `
    };
    return this.sendEmail(mailOptions);
  }

  async sendApplicationStatusUpdate(recipientEmail, applicantName, status) {
    const statusMessages = {
      'shortlisted': 'Congratulations! You have been shortlisted.',
      'accepted': 'Congratulations! Your application has been accepted.',
      'rejected': 'We regret to inform you that your application was not successful.',
      'under-review': 'Your application is under review.'
    };

    const mailOptions = {
      from: config.email.from,
      to: recipientEmail,
      subject: `Application Status Update - Industrial Attachment System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Application Status Update</h2>
          <p>Dear ${applicantName},</p>
          <p>${statusMessages[status] || 'Your application status has been updated.'}</p>
          <p>Log in to your dashboard to view more details.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Industrial Attachment System</p>
        </div>
      `
    };
    return this.sendEmail(mailOptions);
  }

  async sendAdminNotification(adminEmail, subject, message) {
    const mailOptions = {
      from: config.email.from,
      to: adminEmail,
      subject: `[ADMIN] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${subject}</h2>
          <p>${message}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Industrial Attachment System - Admin Alert</p>
        </div>
      `
    };
    return this.sendEmail(mailOptions);
  }

  // Get mock email log for development testing
  getMockEmailLog() {
    return this.emailLog;
  }

  // Clear mock email log
  clearMockEmailLog() {
    this.emailLog = [];
  }
}

module.exports = new EmailService();
