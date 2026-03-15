const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  batchNumber: {
     type: String,
    required: true
  },
  attendanceDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Present'
  },
  recordedBy: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Indexing for faster lookups when generating reports
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance",attendanceSchema)
module.exports = Attendance