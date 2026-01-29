const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465, // true for 465, false for other ports
        auth: {
          user: config.email.user,
          pass: config.email.password
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email configuration error:', error);
        } else {
          console.log('Email service ready');
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendApplicationSubmissionConfirmation(recipientEmail, applicantName, opportunityTitle) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: recipientEmail,
        subject: 'Application Submission Confirmed - Industrial Attachment System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Application Submission Confirmed</h2>
            <p>Dear ${applicantName},</p>
            <p>Your application for the <strong>${opportunityTitle}</strong> opportunity has been successfully received.</p>
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>An admin will verify your M-Pesa payment</li>
              <li>Once verified, your application will be forwarded to the organization</li>
              <li>You will receive further updates via email</li>
            </ol>
            <p>If you have any questions, please contact our support team.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this address.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Application confirmation email sent to:', recipientEmail);
    } catch (error) {
      console.error('Error sending application confirmation email:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(recipientEmail, applicantName, mpesaCode, amount) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: recipientEmail,
        subject: 'Payment Received - Industrial Attachment System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Payment Received</h2>
            <p>Dear ${applicantName},</p>
            <p>We have received your M-Pesa payment for your application.</p>
            <p><strong>Payment Details:</strong></p>
            <ul>
              <li>Transaction Code: <strong>${mpesaCode}</strong></li>
              <li>Amount: <strong>KES ${amount}</strong></li>
            </ul>
            <p>Our admin team will verify your payment shortly. You will receive a confirmation email once the verification is complete.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this address.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Payment confirmation email sent to:', recipientEmail);
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      throw error;
    }
  }

  async sendPaymentVerifiedNotification(recipientEmail, applicantName, opportunityTitle) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: recipientEmail,
        subject: 'Payment Verified - Application Submitted - Industrial Attachment System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Payment Verified ✓</h2>
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
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this address.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Payment verified email sent to:', recipientEmail);
    } catch (error) {
      console.error('Error sending payment verified email:', error);
      throw error;
    }
  }

  async sendPaymentRejectionNotification(recipientEmail, applicantName, rejectionReason) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: recipientEmail,
        subject: 'Payment Verification Failed - Industrial Attachment System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Payment Verification Failed</h2>
            <p>Dear ${applicantName},</p>
            <p>Unfortunately, your M-Pesa payment could not be verified.</p>
            <p><strong>Reason:</strong> ${rejectionReason}</p>
            <p><strong>What You Can Do:</strong></p>
            <ul>
              <li>Double-check your M-Pesa transaction code</li>
              <li>Ensure you sent KES 500 to Till No: 3400188</li>
              <li>Try submitting your payment again with the correct details</li>
            </ul>
            <p>If you continue to experience issues, please contact our support team.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this address.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Payment rejection email sent to:', recipientEmail);
    } catch (error) {
      console.error('Error sending payment rejection email:', error);
      throw error;
    }
  }

  async sendAdminPaymentNotification(adminEmail, applicantName, mpesaCode, amount) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: adminEmail,
        subject: '[ADMIN] New Payment Requires Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ff9800;">New Payment for Verification</h2>
            <p>A new application payment has been submitted and requires verification.</p>
            <p><strong>Applicant:</strong> ${applicantName}</p>
            <p><strong>M-Pesa Code:</strong> <code style="background: #f0f0f0; padding: 5px;">${mpesaCode}</code></p>
            <p><strong>Amount:</strong> KES ${amount}</p>
            <p><strong>Action Required:</strong> Please verify this payment in the admin dashboard and either approve or reject it.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this address.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Admin payment notification sent to:', adminEmail);
    } catch (error) {
      console.error('Error sending admin payment notification:', error);
      throw error;
    }
  }

  async sendApplicationStatusUpdate(recipientEmail, applicantName, opportunityTitle, newStatus, message) {
    try {
      const statusColorMap = {
        'submitted': '#007bff',
        'under-review': '#ffc107',
        'shortlisted': '#28a745',
        'accepted': '#17a2b8',
        'rejected': '#dc3545'
      };

      const mailOptions = {
        from: config.email.from,
        to: recipientEmail,
        subject: `Application Status Update - ${newStatus.toUpperCase()} - Industrial Attachment System`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${statusColorMap[newStatus]};">Application Status Update</h2>
            <p>Dear ${applicantName},</p>
            <p>Your application status for <strong>${opportunityTitle}</strong> has been updated.</p>
            <p><strong>New Status:</strong> <span style="color: ${statusColorMap[newStatus]}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            <p>Log in to the IAS portal to view more details about your application.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this address.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Application status update email sent to:', recipientEmail);
    } catch (error) {
      console.error('Error sending application status update email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(recipientEmail, resetLink) {
    try {
      const mailOptions = {
        from: config.email.from,
        to: recipientEmail,
        subject: 'Password Reset - Industrial Attachment System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested a password reset for your Industrial Attachment System account.</p>
            <p><strong>Click the link below to reset your password:</strong></p>
            <p><a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This is an automated email. Please do not reply to this address.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', recipientEmail);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
