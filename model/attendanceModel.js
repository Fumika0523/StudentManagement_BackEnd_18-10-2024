const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
  },
  attendanceDate: {
    type: Date,
    required: true,
  },
  students: [
    {
      studentId: { type: String, required: true },
      studentName: { type: String, required: true },
      status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true,
      },
    },
  ],
  recordedBy: {
    type: String,
    required: true,
  },
}, { timestamps: true });

 //same date cannot be stored

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;