const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department', required: true
  },
  status: {
    type: String,
    enum: ['Submitted', 'In Review', 'Work in Progress', 'Resolved', 'Closed'],
    default: 'Submitted'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  image: {
    type: String
  },
  attachments: [
    String
  ],
  history: [
    {
      status: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);