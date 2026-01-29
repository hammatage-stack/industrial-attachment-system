const axios = require('axios');
const config = require('../config/config');
const logger = require('./logger');

/**
 * Enhanced M-Pesa Service with STK Push
 * Handles both manual code validation and automated STK Push
 */
class EnhancedMpesaService {
  constructor() {
    this.baseUrl = config.mpesa.apiUrl;
    this.consumerKey = config.mpesa.consumerKey;
    this.consumerSecret = config.mpesa.consumerSecret;
    this.businessShortCode = config.mpesa.businessShortCode;
    this.passkey = config.mpesa.passkey;
  }

  /**
   * Get M-Pesa access token
   */
  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      logger.error('Failed to get M-Pesa access token:', error);
      throw new Error('M-Pesa authentication failed');
    }
  }

  /**
   * Generate password for M-Pesa requests
   */
  generatePassword(timestamp) {
    const data = `${this.businessShortCode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  /**
   * Get current timestamp in required format
   */
  getTimestamp() {
    return new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
  }

  /**
   * Format phone number to M-Pesa format
   */
  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.startsWith('254') ? cleaned : `254${cleaned.slice(-9)}`;
  }

  /**
   * Initiate STK Push (Prompt)
   * Sends payment prompt to user's phone
   */
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(amount),
        PartyA: formattedPhone,
        PartyB: this.businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: config.mpesa.callbackUrl,
        AccountReference: accountReference.substring(0, 12),
        TransactionDesc: transactionDesc.substring(0, 13)
      };

      logger.info('Initiating STK Push for:', { phone: formattedPhone, amount });

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutRequestID: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };
    } catch (error) {
      logger.error('STK Push initiation failed:', error);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'STK Push failed',
        details: error.message
      };
    }
  }

  /**
   * Query STK Push status
   */
  async querySTKPushStatus(checkoutRequestID) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = this.generatePassword(timestamp);

      const payload = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data.ResponseCode === '0',
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        amount: response.data.CallbackMetadata?.item?.[0]?.value,
        mpesaReceiptNumber: response.data.CallbackMetadata?.item?.[1]?.value,
        transactionDate: response.data.CallbackMetadata?.item?.[3]?.value,
        phoneNumber: response.data.CallbackMetadata?.item?.[4]?.value
      };
    } catch (error) {
      logger.error('STK Push query failed:', error);
      return {
        success: false,
        error: 'Query failed'
      };
    }
  }

  /**
   * Simulate STK Push callback (for testing)
   */
  simulateSTKPushCallback(checkoutRequestID, resultCode = '0') {
    return {
      Body: {
        stkCallback: {
          MerchantRequestID: 'test-merchant-request-' + Date.now(),
          CheckoutRequestID: checkoutRequestID,
          ResultCode: resultCode === '0' ? 0 : 1,
          ResultDesc: resultCode === '0' ? 'The service request has been processed successfully.' : 'The user cancelled the USSD request.',
          CallbackMetadata: {
            item: [
              { Name: 'Amount', Value: 500 },
              { Name: 'MpesaReceiptNumber', Value: 'PG4111221101' },
              { Name: 'TransactionDate', Value: 20230101123456 },
              { Name: 'PhoneNumber', Value: 254712345678 }
            ]
          }
        }
      }
    };
  }

  /**
   * Validate M-Pesa transaction status
   */
  async validateTransaction(mpesaCode, amount) {
    try {
      // Check transaction format
      if (!/^[A-Z0-9]{10}$/.test(mpesaCode)) {
        return {
          valid: false,
          error: 'Invalid M-Pesa code format'
        };
      }

      // Check amount
      if (amount !== config.applicationFee) {
        return {
          valid: false,
          error: `Invalid amount. Expected KES ${config.applicationFee}, got KES ${amount}`
        };
      }

      return {
        valid: true,
        mpesaCode: mpesaCode.toUpperCase(),
        amount: amount
      };
    } catch (error) {
      logger.error('Transaction validation error:', error);
      return {
        valid: false,
        error: 'Validation failed'
      };
    }
  }
}

module.exports = new EnhancedMpesaService();
