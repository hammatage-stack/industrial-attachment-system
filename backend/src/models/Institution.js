const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    unique: true
  },
  type: {
    type: String,
    enum: [
      'company',
      'organization',
      'ngo',
      'government-agency',
      'high-school',
      'secondary-school',
      'college',
      'university',
      'tvet',
      'other'
    ],
    required: [true, 'Institution type is required']
  },
  description: {
    type: String,
    maxlength: 2000
  },
  email: {
    type: String,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phoneNumber: String,
  website: String,
  
  // Location Information
  location: {
    county: {
      type: String,
      required: [true, 'County is required'],
      trim: true
    },
    subCounty: {
      type: String,
      required: [true, 'Sub-county is required'],
      trim: true
    },
    subLocation: {
      type: String,
      trim: true
    },
    street: String,
    city: String,
    postalCode: String
  },
  
  // Contact Information
  contactPerson: String,
  contactPersonTitle: String,
  contactPhoneNumber: String,
  
  // Additional Details
  yearsInOperation: Number,
  employeeCount: String,
  sectors: [String], // Industries/sectors the institution operates in
  logo: {
    url: String,
    publicId: String
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending-verification'],
    default: 'pending-verification'
  },
  
  // Meta Information
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

// Indexes for searching and filtering
institutionSchema.index({ name: 'text', description: 'text', sectors: 1 });
institutionSchema.index({ 'location.county': 1, 'location.subCounty': 1 });
institutionSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Institution', institutionSchema);
