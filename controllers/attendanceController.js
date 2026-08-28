// attendanceController.js
const Attendance = require('../model/attendanceModel');

const submitAttendance = async (req, res) => {
 try {
    const attendanceDetail = new Attendance(req.body)
    if(!attendanceDetail){
      res.status(401).send({
        message:"Unable to add attendance record"
      })
    }await attendanceDetail.save()
    res.status(200).send({
      attendanceDetail:attendanceDetail,
      message:"Attendance has been marked successfully."
    })

  } catch (error) {
    res.status(500).json({ error: error });
  }
};


module.exports ={submitAttendance}