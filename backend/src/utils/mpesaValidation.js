/**
 * Enhanced MPesa Validation Service
 * Handles manual paybill validation with regex and duplicate detection
 * 
 * M-Pesa message format:
 * "Your Safaricom account has received an MPESA transfer of KES [amount] from [phone] [name] on [date] [time]. New M-Pesa balance is KES [balance]"
 * 
 * Transaction Code Format (Confirmation message):
 * e.g., "QHG31YRWPF" - 10 characters alphanumeric
 */

class MpesaValidation {
  /**
   * M-Pesa transaction code regex pattern
   * Matches 10-character alphanumeric codes
   * Examples: ABC1234567, QHG31YRWPF, XYZ9876543
   */
  static MPESA_CODE_REGEX = /^[A-Z0-9]{10}$/i;

  /**
   * Phone number regex pattern
   * Kenyan format: 254XXXXXXXXX (12 digits)
   */
  static PHONE_REGEX = /^254[0-9]{9}$/;

  /**
   * Validate M-Pesa transaction code format
   * @param {string} code - The transaction code to validate
   * @returns {object} { valid: boolean, error: string|null }
   */
  static validateTransactionCode(code) {
    if (!code) {
      return {
        valid: false,
        error: 'M-Pesa transaction code is required'
      };
    }

    code = code.toString().trim().toUpperCase();

    if (!this.MPESA_CODE_REGEX.test(code)) {
      return {
        valid: false,
        error: 'Invalid M-Pesa transaction code format. Expected format: 10 alphanumeric characters (e.g., QHG31YRWPF)'
      };
    }

    return {
      valid: true,
      error: null,
      code: code
    };
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - The phone number to validate
   * @returns {object} { valid: boolean, error: string|null, phone: string }
   */
  static validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      return {
        valid: false,
        error: 'Phone number is required'
      };
    }

    const phone = phoneNumber.toString().trim().replace(/[^\d]/g, '');

    // Check if we have only 9 digits (local format like 0712345678)
    if (phone.length === 9 && phone.startsWith('7')) {
      const formattedPhone = '254' + phone.slice(1);
      return {
        valid: true,
        error: null,
        phone: formattedPhone
      };
    }

    // Check if we have 10 digits (local format like 712345678)
    if (phone.length === 10) {
      const formattedPhone = '254' + phone.slice(1);
      return {
        valid: true,
        error: null,
        phone: formattedPhone
      };
    }

    // Check full international format
    if (this.PHONE_REGEX.test(phone)) {
      return {
        valid: true,
        error: null,
        phone: phone
      };
    }

    return {
      valid: false,
      error: 'Invalid phone number format. Expected: 254XXXXXXXXX or 0712345678 or 712345678'
    };
  }

  /**
   * Validate amount
   * @param {number} amount - The amount to validate
   * @param {number} expectedAmount - The expected application fee
   * @returns {object} { valid: boolean, error: string|null, message: string }
   */
  static validateAmount(amount, expectedAmount = 500) {
    if (!amount) {
      return {
        valid: false,
        error: 'Amount is required',
        message: null
      };
    }

    const parsedAmount = parseInt(amount, 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return {
        valid: false,
        error: 'Amount must be a positive number',
        message: null
      };
    }

    // Allow exact match or with small tolerance (±10 KES for rounding)
    const tolerance = 10;
    if (Math.abs(parsedAmount - expectedAmount) <= tolerance) {
      return {
        valid: true,
        error: null,
        message: `Amount received: KES ${parsedAmount}`
      };
    }

    return {
      valid: false,
      error: `Amount mismatch. Expected: KES ${expectedAmount}, Received: KES ${parsedAmount}`,
      message: `Discrepancy of KES ${Math.abs(parsedAmount - expectedAmount)}`
    };
  }

  /**
   * Parse M-Pesa SMS message to extract transaction details
   * @param {string} message - The M-Pesa SMS message
   * @returns {object} Extracted details or null if parsing fails
   */
  static parseMpesaMessage(message) {
    if (!message || typeof message !== 'string') {
      return null;
    }

    try {
      // Extract amount: "received an MPESA transfer of KES [amount]"
      const amountMatch = message.match(/KES\s+([\d,]+)/i);
      const amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, ''), 10) : null;

      // Extract phone: "from [phone]" or "from +[phone]"
      const phoneMatch = message.match(/from\s+(\+?254[\d]+|0[\d]+|[\d]{9,10})/i);
      const rawPhone = phoneMatch ? phoneMatch[1] : null;

      // Extract transaction code: looks for 10-character codes
      const codeMatch = message.match(/([A-Z0-9]{10})/i);
      const code = codeMatch ? codeMatch[1].toUpperCase() : null;

      // Extract timestamp: "on [date] [time]"
      const timeMatch = message.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2})/i);
      const timestamp = timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : null;

      // Extract sender name: usually comes after phone number
      const nameMatch = message.match(/from\s+[\d+]+\s+([A-Za-z\s]+)\s+on/i);
      const senderName = nameMatch ? nameMatch[1].trim() : null;

      return {
        amount,
        phone: rawPhone,
        code,
        timestamp,
        senderName,
        rawMessage: message
      };
    } catch (error) {
      console.error('Error parsing M-Pesa message:', error);
      return null;
    }
  }

  /**
   * Comprehensive validation of M-Pesa payment
   * @param {object} paymentData - { mpesaCode, phoneNumber, amount }
   * @param {number} expectedAmount - Expected application fee
   * @returns {object} { valid: boolean, errors: string[], warnings: string[], data: object }
   */
  static validatePayment(paymentData, expectedAmount = 500) {
    const errors = [];
    const warnings = [];
    const validatedData = {};

    // Validate transaction code
    const codeValidation = this.validateTransactionCode(paymentData.mpesaCode);
    if (!codeValidation.valid) {
      errors.push(codeValidation.error);
    } else {
      validatedData.mpesaCode = codeValidation.code;
    }

    // Validate phone number
    const phoneValidation = this.validatePhoneNumber(paymentData.phoneNumber);
    if (!phoneValidation.valid) {
      errors.push(phoneValidation.error);
    } else {
      validatedData.phoneNumber = phoneValidation.phone;
    }

    // Validate amount if provided
    if (paymentData.amount !== undefined) {
      const amountValidation = this.validateAmount(paymentData.amount, expectedAmount);
      if (!amountValidation.valid) {
        errors.push(amountValidation.error);
      } else if (amountValidation.message) {
        warnings.push(amountValidation.message);
      }
      validatedData.amount = paymentData.amount;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: validatedData
    };
  }

  /**
   * Check for duplicate transaction codes in database
   * @param {string} code - Transaction code to check
   * @param {object} Payment - Payment model
   * @returns {Promise<object>} { isDuplicate: boolean, existingPayment: object|null }
   */
  static async checkDuplicateTransaction(code, Payment) {
    try {
      const normalizedCode = code.toString().trim().toUpperCase();
      
      const existingPayment = await Payment.findOne({
        mpesaCode: normalizedCode
      }).select('id status application user createdAt');

      if (existingPayment) {
        return {
          isDuplicate: true,
          existingPayment: {
            id: existingPayment._id,
            status: existingPayment.status,
            application: existingPayment.application,
            user: existingPayment.user,
            createdAt: existingPayment.createdAt
          },
          error: `This M-Pesa transaction code (${normalizedCode}) has already been used. Each transaction can only be used once.`
        };
      }

      return {
        isDuplicate: false,
        existingPayment: null,
        error: null
      };
    } catch (error) {
      console.error('Error checking duplicate transaction:', error);
      throw new Error('Failed to check transaction history');
    }
  }

  /**
   * Check for recent duplicate phone + amount combinations
   * (Additional fraud check)
   * @param {string} phoneNumber - Phone number
   * @param {number} amount - Amount
   * @param {object} Payment - Payment model
   * @param {number} minutesWindow - Time window in minutes (default: 60)
   * @returns {Promise<object>} { hasSimilar: boolean, reason: string|null }
   */
  static async checkRecentActivity(phoneNumber, amount, Payment, minutesWindow = 60) {
    try {
      const timeWindow = new Date(Date.now() - minutesWindow * 60 * 1000);
      
      const recentPayment = await Payment.findOne({
        phoneNumber: phoneNumber,
        amount: amount,
        createdAt: { $gte: timeWindow }
      }).select('id createdAt');

      if (recentPayment) {
        const minutesAgo = Math.round((Date.now() - recentPayment.createdAt) / 60000);
        return {
          hasSimilar: true,
          reason: `Similar payment from this number was recorded ${minutesAgo} minute(s) ago. Please verify you haven't already submitted.`,
          lastPayment: recentPayment.createdAt
        };
      }

      return {
        hasSimilar: false,
        reason: null
      };
    } catch (error) {
      console.error('Error checking recent activity:', error);
      // Don't throw - this is a secondary check
      return {
        hasSimilar: false,
        reason: null
      };
    }
  }
}

module.exports = MpesaValidation;
