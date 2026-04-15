const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'Submitted', enum: ['Submitted', 'In Review', 'Work in Progress', 'Resolved', 'Closed'] },
  image: { type: String },
  attachments: [{ type: String }],
  history: [{ status: String, timestamp: Date }],
  
  // ✨ NEW AI FIELDS ✨
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'low' },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'], default: 'Neutral' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);