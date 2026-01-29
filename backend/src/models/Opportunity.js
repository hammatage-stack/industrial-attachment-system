const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  companyEmail: {
    type: String,
    required: [true, 'Company email is required'],
    trim: true
  },
  companyPhone: {
    type: String,
    required: [true, 'Company phone is required']
  },
  title: {
    type: String,
    required: [true, 'Opportunity title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  type: {
    type: String,
    enum: ['internship', 'industrial-attachment', 'both'],
    required: [true, 'Opportunity type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'IT & Software',
      'Engineering',
      'Business & Finance',
      'Marketing & Sales',
      'Healthcare',
      'Education',
      'Manufacturing',
      'Hospitality',
      'Media & Communications',
      'Other'
    ]
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  requirements: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  availableSlots: {
    type: Number,
    required: [true, 'Available slots is required'],
    min: 1
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'draft', 'archived'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for searching
opportunitySchema.index({ title: 'text', description: 'text', companyName: 'text' });

module.exports = mongoose.model('Opportunity', opportunitySchema);
