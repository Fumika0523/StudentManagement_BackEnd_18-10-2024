// attendanceController.js
const Attendance = require('../model/attendanceModel');

exports.submitAttendance = async (req, res) => {
  try {
    const { batchId, date, attendanceRecords } = req.body; 
    // attendanceRecords would be an array: [{ studentId: '...', status: 'Present' }]

    const bulkOps = attendanceRecords.map(record => ({
      updateOne: {
        filter: { student: record.studentId, batch: batchId, date: new Date(date) },
        update: { status: record.status, recordedBy: req.user.id },
        upsert: true // Creates a new record if it doesn't exist, updates if it does
      }
    }));

    await Attendance.bulkWrite(bulkOps);
    res.status(200).json({ message: "Attendance updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};