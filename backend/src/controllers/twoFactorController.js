const crypto = require('crypto');
const OTP = require('../models/OTP');
const User = require('../models/User');
const emailService = require('../utils/emailServiceEnhanced');
const smsService = require('../utils/smsService');
const logger = require('../utils/logger');

/**
 * 2FA Controller
 * Manages two-factor authentication
 */
exports.generateOTP = async (req, res) => {
  try {
    const { userId, method } = req.body;

    if (!['email', 'sms'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid method. Use "email" or "sms"'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create OTP record
    const otp = await OTP.create({
      user: userId,
      code,
      type: method,
      deliveredTo: method === 'email' ? user.email : user.phoneNumber
    });

    // Send OTP
    if (method === 'email') {
      await emailService.sendOTPEmail(user.email, code);
    } else {
      await smsService.sendOTPSMS(user.phoneNumber, code);
    }

    logger.info(`OTP generated for user ${userId} via ${method}`);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${method === 'email' ? user.email : user.phoneNumber}`,
      otpId: otp._id,
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    logger.error('OTP generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OTP',
      error: error.message
    });
  }
};

/**
 * Verify OTP
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { otpId, code } = req.body;

    const otp = await OTP.findById(otpId);
    if (!otp) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    if (otp.verified) {
      return res.status(400).json({
        success: false,
        message: 'OTP already verified'
      });
    }

    if (otp.attempts >= 5) {
      await OTP.deleteOne({ _id: otpId });
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Request new OTP'
      });
    }

    if (new Date() > otp.expiresAt) {
      await OTP.deleteOne({ _id: otpId });
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    if (otp.code !== code) {
      otp.attempts += 1;
      await otp.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: 5 - otp.attempts
      });
    }

    // Mark as verified
    otp.verified = true;
    await otp.save();

    // Enable 2FA on user
    await User.findByIdAndUpdate(req.user.id, {
      twoFactorEnabled: true,
      twoFactorMethod: otp.type
    });

    logger.info(`OTP verified for user ${otp.user}`);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. 2FA enabled'
    });
  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
};

/**
 * Disable 2FA
 */
exports.disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: false,
      twoFactorMethod: null
    });

    // Delete any pending OTPs
    await OTP.deleteMany({ user: userId, verified: false });

    logger.info(`2FA disabled for user ${userId}`);

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    logger.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA',
      error: error.message
    });
  }
};

/**
 * Get 2FA status
 */
exports.get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('twoFactorEnabled twoFactorMethod');

    res.status(200).json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
      method: user.twoFactorMethod
    });
  } catch (error) {
    logger.error('2FA status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get 2FA status',
      error: error.message
    });
  }
};

/**
 * Generate backup codes for 2FA
 */
exports.generateBackupCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const backupCodes = [];

    for (let i = 0; i < 10; i++) {
      backupCodes.push(
        crypto
          .randomBytes(4)
          .toString('hex')
          .toUpperCase()
      );
    }

    // Store hashed backup codes
    const hashedCodes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    await User.findByIdAndUpdate(userId, {
      backupCodes: hashedCodes
    });

    logger.info(`Backup codes generated for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Backup codes generated. Save them in a secure location',
      backupCodes,
      warning: 'These codes will not be shown again'
    });
  } catch (error) {
    logger.error('Backup codes generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate backup codes',
      error: error.message
    });
  }
};
