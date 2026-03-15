const Admission = require('../model/admissionModel')
const Student = require('../model/studentModel')
const Batch = require('../model/batchModel')
const User = require('../model/userModel')

// need to update batch number,
const addAdmission = async (req, res) => {
  try {
    const {
      batchNumber,
      courseId,
      studentId,
      studentName,
      courseName,
      admissionSource,
      admissionFee,
      admissionDate,
      admissionYear,
      admissionMonth,
      status,
    } = req.body;

    // Basic validation
    if (!batchNumber || !courseId || !studentId || !studentName || !courseName || !admissionDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check student directly
       const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }


    const existingAdmission = await Admission.findOne({ studentId, batchNumber });
    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: "This student is already assigned to this batch.",
      });
    }

    const batch = await Batch.findOne({ batchNumber });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const assigned = Number(batch.assignedStudentCount || 0);
    const target = Number(batch.targetStudent || 0);

    if (target > 0 && assigned >= target) {
      return res.status(400).json({
        success: false,
        message: "Sorry! This batch is full.",
      });
    }

    const createdAdmission = await Admission.create({
      batchNumber,
      courseId,
      studentId,
      studentName,
      courseName,
      admissionSource,
      admissionFee,
      admissionDate,
      admissionYear,
      admissionMonth,
      status: status || "Assigned",
    });

    await Student.findByIdAndUpdate(studentId, {
      $set: {
        status: status || "Assigned",
        batchNumber,
        courseId,
        courseName,
        admissionDate,
        admissionFee,
        admissionId: createdAdmission._id,
      },
    });

    await Batch.findOneAndUpdate(
      { batchNumber },
      { $inc: { assignedStudentCount: 1 } }
    );

    return res.status(201).json({
      success: true,
      message: "Admission added successfully.",
      admission: createdAdmission,
    });
  } catch (error) {
    console.error("addAdmission error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding admission.",
    });
  }
};

//GET: All Admission
const getAllAdmission = async(req,res)=>{
    try{
      const getAdmissionData = await Admission.find()
        if(!getAdmissionData){
            res.send({message:"The Admission Data canot be found"})
        }res.send({admissionData:getAdmissionData})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }}

// GET: Single Admission
const getSingleAdmission = async(req,res)=>{
    const admissionById = await Admission.findById(
        {_id:req.params.id}
    )
    if(!admissionById){
        res.send({message:"Admission data is not found"})
    }res.send({admissionData:admissionById})
}

//Put: Update Admission

const updateAdmission = async (req, res) => {
  try {
    const admissionId = req.params.id;

    const currentAdmission = await Admission.findById(admissionId);
    if (!currentAdmission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    if (
      req.body.studentId &&
      String(req.body.studentId) !== String(currentAdmission.studentId)
    ) {
      return res.status(400).json({
        message: "Changing studentId is not allowed.",
      });
    }

    const studentId = currentAdmission.studentId;
    const oldBatchNumber = currentAdmission.batchNumber;
    const newBatchNumber = req.body.batchNumber || oldBatchNumber;

    // If batch is changing, check new batch first
    if (newBatchNumber !== oldBatchNumber) {
      const newBatch = await Batch.findOne({ batchNumber: newBatchNumber });
      if (!newBatch) {
        return res.status(404).json({ message: "Target batch not found" });
      }

      const assigned = Number(newBatch.assignedStudentCount || 0);
      const target = Number(newBatch.targetStudent || 0);

      if (target > 0 && assigned >= target) {
        return res.status(400).json({ message: "Sorry! This batch is full." });
      }
    }

    const updatedAdmission = await Admission.findByIdAndUpdate(
      admissionId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedAdmission) {
      return res.status(500).json({ message: "Failed to update admission" });
    }

    // Adjust batch counts only if batch changed
    if (newBatchNumber !== oldBatchNumber) {
      await Batch.findOneAndUpdate(
        { batchNumber: newBatchNumber },
        { $inc: { assignedStudentCount: 1 } }
      );

      if (oldBatchNumber) {
        await Batch.findOneAndUpdate(
          { batchNumber: oldBatchNumber, assignedStudentCount: { $gt: 0 } },
          { $inc: { assignedStudentCount: -1 } }
        );
      }
    }

    await Student.findByIdAndUpdate(studentId, {
      $set: {
        status: updatedAdmission.status || "Assigned",
        batchNumber: updatedAdmission.batchNumber,
        courseId: updatedAdmission.courseId,
        courseName: updatedAdmission.courseName,
        admissionDate: updatedAdmission.admissionDate,
        admissionFee: updatedAdmission.admissionFee,
      },
    });

    return res.status(200).json({
      message: "Admission updated successfully",
      admission: updatedAdmission,
    });
  } catch (err) {
    console.error("Error in updateAdmission:", err);
    return res.status(500).json({
      message: "Some Internal Error",
      error: err.message,
    });
  }
};

// check studentassignedCount >>  decrease the studentAssignedCount by 1 >>> role : admin
const deleteAdmission = async (req, res) => {
  try {
    console.log("Delete Admission by ID", req.params.id);

    // 1) Find the admission first (to know which batch it belongs to)
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    const batchNumber = admission.batchNumber;

    // 2) Delete the admission
    await Admission.findByIdAndDelete(req.params.id);

    // 3) Decrement the assignedStudentCount of the batch safely
    if (batchNumber) {
      await Batch.findOneAndUpdate(
        { batchNumber, assignedStudentCount: { $gt: 0 } }, // prevent negative
        { $inc: { assignedStudentCount: -1 } },
        { new: true }
      );
    }

    return res.status(200).json({
      message: "Admission has been deleted successfully",
      deletedAdmission: admission
    });

  } catch (e) {
    console.error("Error deleting admission:", e);
    return res.status(500).json({ message: "Some Internal Error" });
  }
};

module.exports= {addAdmission, getAllAdmission, getSingleAdmission, updateAdmission, deleteAdmission}