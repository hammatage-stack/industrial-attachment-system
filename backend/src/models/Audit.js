const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: Object },
  ip: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Audit', auditSchema);
