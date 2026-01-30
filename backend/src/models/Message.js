const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  messages: [
    {
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  lastMessage: {
    type: String,
    default: null
  }
}, { timestamps: true });

messageSchema.index({ participants: 1 });

module.exports = mongoose.model('Message', messageSchema);
