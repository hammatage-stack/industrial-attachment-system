const mongoose = require('mongoose');

/**
 * OTP (One-Time Password) Schema for 2FA
 * Manages two-factor authentication via email/SMS
 */
const otpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['email', 'sms'],
    required: true
  },
  deliveredTo: {
    type: String, // email or phone
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  verified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for auto-deletion of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for finding user OTPs
otpSchema.index({ user: 1, verified: 1 });

module.exports = mongoose.model('OTP', otpSchema);
