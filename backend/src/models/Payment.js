const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    default: 500
  },
  
  // MPesa Transaction Details
  mpesaCode: {
    type: String,
    required: [true, 'M-Pesa transaction code is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{10}$/, 'Invalid M-Pesa transaction code format'],
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^254[0-9]{9}$/, 'Phone number must be in format 254XXXXXXXXX']
  },
  
  // Validation Status
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'duplicate'],
    default: 'pending'
  },
  
  // Verification Info
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationNotes: String,
  
  // Audit Trail
  rejectionReason: String,
  rejectedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Meta
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
