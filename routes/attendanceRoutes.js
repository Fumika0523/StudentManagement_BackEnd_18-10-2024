const express = require('express');
const router = express.Router();
const { auth, authorizationRole } = require('../middleware/auth');
const { submitAttendance } = require('../controllers/attendanceController');

// @route   POST /api/attendance/mark
// @desc    Submit or Update bulk attendance for a batch
// @access  Private (Admin & Staff)
router.post(
    '/attendance', 
    auth, 
    authorizationRole(["admin", "staff"]), 
    submitAttendance
);

// @route   GET /api/attendance/:batchId/:date
// @desc    Get attendance records for a specific batch and date
// @access  Private (Admin & Staff)
// router.get('/:batchId/:date', auth, authorizationRole(["admin", "staff"]), getAttendanceByDate);

module.exports = router;