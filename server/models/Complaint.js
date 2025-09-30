const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  // MODIFIED: More descriptive status options
  status: { 
    type: String, 
    enum: ['Submitted', 'In Review', 'Work in Progress', 'Resolved', 'Closed'], 
    default: 'Submitted' 
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachments: [String],
  // ADDED: An array to log the history of status changes
  history: [
    {
      status: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);