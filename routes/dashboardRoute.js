const express = require('express');
const router = express.Router();
const Admission = require('../model/admissionModel');
const Student = require('../model/studentModel');
const Batch = require('../model/batchModel');
const { auth, authorizationRole } = require('../middleware/auth');

router.get('/earnings', auth, authorizationRole("admin"), async (req, res) => {
  try {
    //  Read month and year from query params
    const { month, year } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month
      ? new Date(`${month} 1, ${currentYear}`).getMonth() + 1
      : new Date().getMonth() + 1;

    //  Define time boundaries
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth, 1);

    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    //  Admissions (Monthly & Annual)
    const monthlyAdmissions = await Admission.find({
      admissionDate: { $gte: startOfMonth, $lt: startOfNextMonth },
    }).select("admissionFee");

    const yearlyAdmissions = await Admission.find({
      admissionDate: { $gte: startOfYear, $lt: startOfNextYear },
    }).select("admissionFee");

    // array.reduce((accumulator, currentValue) => { ... }, initialValue)
    //accumulator → a running total (we call it sum)
    //currentValue → the current item in the loop (we call it a)
    //initialValue → the starting value for sum (in our case: 0)
    const monthlyEarning = monthlyAdmissions.reduce((sum, a) => sum + a.admissionFee, 0);
    const annualEarning = yearlyAdmissions.reduce((sum, a) => sum + a.admissionFee, 0);

    // Enrollment
    const monthlyEnrollmentCount = monthlyAdmissions.length;
    const annualEnrollmentCount = yearlyAdmissions.length;

    // Students
    const monthlyStudentCount = await Student.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: startOfNextMonth },
      //  "greater than or equal to"
      //less than
    });
    const annualStudentCount = await Student.countDocuments({
      createdAt: { $gte: startOfYear, $lt: startOfNextYear },
    });

    // Batches
    const monthlyBatchCount = await Batch.countDocuments({
      startDate: { $gte: startOfMonth, $lt: startOfNextMonth },
    });
    const annualBatchCount = await Batch.countDocuments({
      startDate: { $gte: startOfYear, $lt: startOfNextYear },
    });

    // Send response
    res.json([
      { title: "EARNINGS", total: monthlyEarning, icon: "TfiBag", color: "#4e73df" },
      { title: "STUDENTS", total: monthlyStudentCount, icon: "FaDollarSign", color: "#1cc88a" },
      { title: "BATCHES", total: monthlyBatchCount, icon: "FaClipboardList", color: "#36b9cc" },
      { title: "ENROLLMENTS", total: monthlyEnrollmentCount, icon: "IoIosChatbubbles", color: "#f6c23e" },
      { title: "EARNINGS", total: annualEarning, icon: "TfiBag", color: "#4e73df" },
      { title: "STUDENTS", total: annualStudentCount, icon: "FaDollarSign", color: "#1cc88a" },
      { title: "BATCHES", total: annualBatchCount, icon: "FaClipboardList", color: "#36b9cc" },
      { title: "ENROLLMENTS", total: annualEnrollmentCount, icon: "IoIosChatbubbles", color: "#f6c23e" },
    ]);
  } catch (err) {
    console.error("Error in /earnings:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
