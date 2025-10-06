const Admission = require('../model/admissionModel')
const Student = require('../model/studentModel')
const Batch = require('../model/batchModel')
const express = require('express')
const router = express.Router()
const { auth, authorizationRole } = require('../middleware/auth')

// GET earnings (monthly + annual)
router.get('/earnings', auth, authorizationRole("admin"), async (req, res) => {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Date
    const startOfMonth = new Date(currentYear, now.getMonth(), 1)
    const startOfNextMonth = new Date(currentYear, now.getMonth() + 1, 1)

    const startOfYear = new Date(currentYear, 0, 1)
    const startOfNextYear = new Date(currentYear + 1, 0, 1)

    // Admissions
    const getAdmissionMonth = await Admission.find(
      { admissionDate: { $gte: startOfMonth, $lt: startOfNextMonth } },
      { admissionFee: 1, _id: 0 }
    )
    const monthlyEarning = getAdmissionMonth.reduce((acc, cv) => acc + cv.admissionFee, 0)

    const getAdmissionYear = await Admission.find(
      { admissionDate: { $gte: startOfYear, $lt: startOfNextYear } },
      { admissionFee: 1, _id: 0 }
    )
    const annualEarning = getAdmissionYear.reduce((acc, cv) => acc + cv.admissionFee, 0)

// Enrollmenet
    const getEnrollmentMonth = await Admission.find({
      admissionDate: { $gte: startOfMonth, $lt: startOfNextMonth }
    })
    const monthlyEnrollmentCount = getEnrollmentMonth.length

    const getEnrollmentYear = await Admission.find({
      admissionDate: { $gte: startOfYear, $lt: startOfNextYear }
    })
    const annualEnrollmentCount = getEnrollmentYear.length

// STUDENT
    const getStudentMonth = await Student.find({
      createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }
    })
    const monthlyStudentCount = getStudentMonth.length

    const getStudentYear = await Student.find({
      createdAt: { $gte: startOfYear, $lt: startOfNextYear }
    })
    const studentCountYear = getStudentYear.length

  //  BATCH
    const getBatchMonth = await Batch.aggregate([
      {
        $addFields: {
          startYear: { $year: "$startDate" },
          startMonth: { $month: "$startDate" }
        }
      },
      {
        $match: {
          startYear: currentYear,
          startMonth: currentMonth
        }
      }
    ])
    const monthlyBatchCount = getBatchMonth.length

    const getBatchYear = await Batch.find({
      startDate: { $gte: startOfYear, $lt: startOfNextYear }
    })
    const batchCountYear = getBatchYear.length

    res.send([
      {
        title: "EARNINGS",
        total: monthlyEarning,
        icon: "TfiBag",
        color: "#4e73df"
      },
      {
        title: "STUDENTS",
        total: monthlyStudentCount,
        icon: "FaDollarSign",
        color: "#1cc88a"
      },
      {
        title: "BATCHES",
        total: monthlyBatchCount,
        icon: "FaClipboardList",
        color: "#36b9cc"
      },
      {
        title: "ENROLLMENTS", // ✅ FIXED
        total: monthlyEnrollmentCount,
        icon: "IoIosChatbubbles",
        color: "#f6c23e"
      },
      {
        title: "EARNINGS",
        total: annualEarning,
        icon: "TfiBag",
        color: "#4e73df"
      },
      {
        title: "STUDENTS",
        total: studentCountYear,
        icon: "FaDollarSign",
        color: "#1cc88a"
      },
      {
        title: "BATCHES",
        total: batchCountYear,
        icon: "FaClipboardList",
        color: "#36b9cc"
      },
      {
        title: "ENROLLMENTS", // ✅ FIXED
        total: annualEnrollmentCount,
        icon: "IoIosChatbubbles",
        color: "#f6c23e"
      }
    ])
  } catch (err) {
    console.error("Error in /earnings:", err)
    res.status(500).send({ error: "Internal Server Error" })
  }
})

module.exports = router
