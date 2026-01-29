const mongoose = require('mongoose');

/**
 * Schedule Schema for Interview Management
 * Manages interview scheduling between students and companies
 */
const scheduleSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  type: {
    type: String,
    enum: ['phone', 'video', 'in-person'],
    required: true,
    default: 'phone'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 30
  },
  location: {
    type: String, // For in-person interviews
    default: null
  },
  meetingLink: {
    type: String, // For video interviews (Zoom, Meet, etc.)
    default: null
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: {
    student: String,
    interviewer: String
  },
  result: {
    outcome: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'pending_decision'],
      default: 'pending'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    completedAt: Date
  },
  reminders: {
    studentNotified: {
      type: Boolean,
      default: false
    },
    interviewerNotified: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying schedules
scheduleSchema.index({ student: 1, scheduledDate: 1 });
scheduleSchema.index({ interviewer: 1, scheduledDate: 1 });
scheduleSchema.index({ application: 1 });
scheduleSchema.index({ scheduledDate: 1, status: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
