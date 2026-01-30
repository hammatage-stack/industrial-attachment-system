const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required']
  },
  idType: {
    type: String,
    enum: ['national-id', 'passport', 'alien-id'],
    required: [true, 'ID type is required']
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
    trim: true
  },
  
  // Educational Information
  institution: {
    type: String,
    required: [true, 'Institution is required']
  },
  course: {
    type: String,
    required: [true, 'Course is required']
  },
  yearOfStudy: {
    type: String,
    required: [true, 'Year of study is required']
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required']
  },
  
  // Application Type
  applicationType: {
    type: String,
    enum: ['internship', 'industrial-attachment'],
    required: [true, 'Application type is required']
  },
  
  // Document Uploads
  resume: {
    url: {
      type: String,
      required: [true, 'Resume is required']
    },
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  recommendationLetter: {
    url: {
      type: String,
      required: [true, 'Recommendation letter is required']
    },
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  referralForm: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  
  // Cover Letter
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  
  // Payment Information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed', 'rejected'],
      default: 'pending'
    },
    amount: {
      type: Number,
      default: 500
    },
    transactionId: String,
    mpesaReceiptNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    phoneNumber: String,
    paymentDate: Date,
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'payment-submitted', 'payment-verified', 'under-review', 'shortlisted', 'accepted', 'rejected'],
    default: 'draft'
  },
  
  // Timeline with timestamps for each status change
  timeline: [
    {
      status: {
        type: String,
        enum: ['submitted', 'payment-submitted', 'payment-verified', 'under-review', 'shortlisted', 'accepted', 'rejected']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    }
  ],
  
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying
applicationSchema.index({ applicant: 1, opportunity: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ status: 1 });
applicationSchema.index({ 'payment.mpesaReceiptNumber': 1 }, { sparse: true }); // Unique MPesa code
applicationSchema.index({ email: 1 }); // Email index for duplicate checks

module.exports = mongoose.model('Application', applicationSchema);
