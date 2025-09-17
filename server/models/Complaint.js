const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  status: { type: String, enum: ['open','in_progress','resolved','closed'], default: 'open' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachments: [String]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
