const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  admissionNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  regNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  fullName: {
    type: String,
    required: false,
    trim: true
  },
  institution: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  savedOpportunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' }],
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phoneNumber: {
    type: String,
    required: false,
    match: [/^254[0-9]{9}$/, 'Phone number must be in format 254XXXXXXXXX']
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'company'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
