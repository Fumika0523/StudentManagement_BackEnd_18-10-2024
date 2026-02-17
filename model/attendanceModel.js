const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch', 
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Present'
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }
}, { timestamps: true });

// Indexing for faster lookups when generating reports
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });