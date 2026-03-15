const express = require('express');
const router = express.Router();
const { auth, authorizationRole } = require('../middleware/auth');
const { submitAttendance } = require('../controllers/attendanceController');


router.post(
    '/update-attendance', 
    // auth, 
    // authorizationRole(["admin", "staff"]), 
    submitAttendance
);


module.exports = router;