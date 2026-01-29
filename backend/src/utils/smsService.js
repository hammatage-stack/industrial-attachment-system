const config = require('../config/config');
const logger = require('./logger');

/**
 * SMS Notification Service using Africa's Talking
 * Supports bulk SMS, payment alerts, application status updates
 */
class SMSService {
  constructor() {
    this.apiKey = config.sms?.apiKey || process.env.AFRICAS_TALKING_API_KEY;
    this.username = config.sms?.username || 'sandbox';
    this.apiUrl = 'https://api.sandbox.africastalking.com/version1/messaging';
    
    if (this.username !== 'sandbox') {
      this.apiUrl = 'https://api.africastalking.com/version1/messaging';
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(phoneNumber, message) {
    try {
      if (!this.apiKey) {
        logger.warn('Africa\'s Talking API key not configured');
        return {
          success: false,
          error: 'SMS service not configured'
        };
      }

      const axios = require('axios');
      const response = await axios.post(
        this.apiUrl,
        {
          username: this.username,
          to: `+${phoneNumber}`,
          message: message
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'apiKey': this.apiKey
          }
        }
      );

      logger.info('SMS sent successfully to:', phoneNumber);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmationSMS(phoneNumber, paymentDetails) {
    const message = `
Industrial Attachment System:
Payment Received!
Amount: KES ${paymentDetails.amount}
Code: ${paymentDetails.mpesaCode}
Status: Pending Verification
Ref: ${paymentDetails.applicationId}
    `.trim();

    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send payment verification SMS
   */
  async sendPaymentVerifiedSMS(phoneNumber, mpesaCode) {
    const message = `
Industrial Attachment System:
Payment Verified!
Code: ${mpesaCode}
Your application fee has been confirmed.
You can now complete your application.
    `.trim();

    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send payment rejection SMS
   */
  async sendPaymentRejectionSMS(phoneNumber, reason) {
    const message = `
Industrial Attachment System:
Payment Rejected!
Reason: ${reason}
Please resubmit your payment.
Contact support for assistance.
    `.trim();

    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send application status SMS
   */
  async sendApplicationStatusSMS(phoneNumber, status, opportunityTitle) {
    const statusMessages = {
      'submitted': 'Your application has been submitted',
      'under-review': `Your application for "${opportunityTitle}" is under review`,
      'accepted': `Great news! Your application for "${opportunityTitle}" has been accepted!`,
      'rejected': `Your application for "${opportunityTitle}" has been rejected`
    };

    const message = `
Industrial Attachment System:
${statusMessages[status] || 'Your application status has changed'}
Log in to your dashboard for details.
    `.trim();

    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(recipients, message) {
    try {
      const axios = require('axios');
      const response = await axios.post(
        this.apiUrl,
        {
          username: this.username,
          recipients: recipients,
          message: message
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'apiKey': this.apiKey
          }
        }
      );

      logger.info('Bulk SMS sent to', recipients.length, 'recipients');
      return {
        success: true,
        sentCount: recipients.length,
        data: response.data
      };
    } catch (error) {
      logger.error('Bulk SMS failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send OTP SMS for 2FA
   */
  async sendOTPSMS(phoneNumber, otp) {
    const message = `
Your Industrial Attachment System verification code is: ${otp}
This code expires in 10 minutes.
Do not share this code with anyone.
    `.trim();

    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordResetSMS(phoneNumber, resetLink) {
    const message = `
Industrial Attachment System:
Password Reset Request
Click link to reset: ${resetLink}
Link expires in 1 hour.
If you didn't request this, ignore this message.
    `.trim();

    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Format phone number for Africa's Talking
   */
  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.startsWith('254') ? `+${cleaned}` : `+254${cleaned.slice(-9)}`;
  }
}

module.exports = new SMSService();
