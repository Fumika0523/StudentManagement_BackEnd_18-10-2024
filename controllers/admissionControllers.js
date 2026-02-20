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
      status, // "Assigned"
    } = req.body;

    // basic validation first (cheaper)
    if (!batchNumber || !courseId || !studentId || !studentName || !courseName || !admissionDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    //  Fetch student with email too (needed for fallback)
    const student = await Student.findById(studentId).select("userId email");
    if (!student) return res.status(404).json({ message: "Student not found" });

    //  Resolve userId (fallback for legacy students)
    let userId = student.userId;

    if (!userId) {
      const email = String(student.email || "").trim().toLowerCase();
      if (!email) return res.status(404).json({ message: "Student email missing" });

      const userByEmail = await User.findOne({ email }).select("_id isActive role");
      if (!userByEmail) return res.status(404).json({ message: "User not found for student" });

      userId = userByEmail._id;

      // ✅ link it so next time it works instantly
      await Student.updateOne({ _id: studentId }, { $set: { userId } });
    }

    // ✅ Now check user
    const user = await User.findById(userId).select("isActive role");
    if (!user) return res.status(404).json({ message: "User not found for student" });

    if (user.role !== "student") return res.status(400).json({ message: "User role is not student" });
    if (user.isActive === false) return res.status(403).json({ message: "This student is disabled" });


// 1) Block duplicate assignment to the SAME batch
const dupSameBatch = await Admission.findOne({ studentId, batchNumber }).lean();
if (dupSameBatch) {
  return res.status(409).json({
    success: false,
    message: "This student is already assigned to this batch.",
  });
}

// 2) Check if student has any ACTIVE admission (batch not completed)
const priorAdmissions = await Admission.find({ studentId })
  .select("batchNumber")
  .lean();

if (priorAdmissions.length > 0) {
  const priorBatchNumbers = [
    ...new Set(priorAdmissions.map((a) => String(a.batchNumber)).filter(Boolean)),
  ];

  // Fetch statuses for those batches
  const priorBatches = await Batch.find({ batchNumber: { $in: priorBatchNumbers } })
    .select("batchNumber status")
    .lean();

  const statusByBatch = new Map(
    priorBatches.map((b) => [String(b.batchNumber), String(b.status || "")])
  );

  // If ANY prior batch is NOT "Batch Completed", block re-assignment
  const hasActiveAssignment = priorBatchNumbers.some((bn) => {
    const st = statusByBatch.get(String(bn)) || "";
    return st !== "Batch Completed";
  });

  if (hasActiveAssignment) {
    return res.status(409).json({
      success: false,
      message:
        "This student is already assigned to an active batch. They can be reassigned only after the previous batch is completed.",
    });
  }
}
const batch = await Batch.findOne({ batchNumber }).select("assignedStudentCount targetStudent status").lean();
if (!batch) return res.status(404).json({ message: "Batch not found" });

const assigned = Number(batch.assignedStudentCount || 0);
const target = Number(batch.targetStudent || 0);

if (target > 0 && assigned >= target) {
  return res.status(400).json({ message: "Sorry! This batch is full." });
}

    // Create Admission
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

    // Update Student status
    await Student.findByIdAndUpdate(
      studentId,
      {
        $set: {
          status: status || "Assigned",
          batchNumber,
          courseId,
          courseName,
          admissionDate,
          admissionFee,
        },
      },
      { new: true }
    );

    // Update batch assigned count
    await Batch.findOneAndUpdate(
      { batchNumber },
      { $inc: { assignedStudentCount: 1 } },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Admission added and student status updated.",
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


const getAllAdmission = async(req,res)=>{
     try{
     //   console.log(req.token)
        const getAdmissionData = await Admission.find()
        if(!getAdmissionData){
            res.send({message:"The Admission Data canot be found"})
        }res.send({admissionData:getAdmissionData})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }}

    const getSingleAdmission = async(req,res)=>{
    const admissionById = await Admission.findById(
        {_id:req.params.id}
    )
    if(!admissionById){
        res.send({message:"Admission data is not found"})
    }res.send({admissionData:admissionById})
}

// Count should be incre/dec >>> if initially batchNumber is not alloted > Later update
const updateAdmission = async (req, res) => {
  const admissionId = req.params.id;

  try {
    const currentAdmission = await Admission.findById(admissionId);
    if (!currentAdmission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    // Prevent changing studentId via update (recommended)
    if (req.body.studentId && String(req.body.studentId) !== String(currentAdmission.studentId)) {
      return res.status(400).json({ message: "Changing studentId is not allowed in updateAdmission." });
    }

    const studentId = currentAdmission.studentId;

    const oldBatchNumber = currentAdmission.batchNumber;
    const newBatchNumber = req.body.batchNumber;

    // 1) If batchNumber not provided or not changing => update admission only + sync student fields
    if (!newBatchNumber || newBatchNumber === oldBatchNumber) {
      const updatedAdmission = await Admission.findOneAndUpdate(
        { _id: admissionId },
        req.body,
        { new: true, runValidators: true }
      );

      //  Sync student status based on admission status (default "Assigned")
      const nextStatus = updatedAdmission?.status || "Assigned";

      await Student.findByIdAndUpdate(studentId, {
        $set: {
          status: nextStatus,
          // optional fields (only keep if your studentModel has them)
          batchNumber: updatedAdmission.batchNumber,
          courseId: updatedAdmission.courseId,
          courseName: updatedAdmission.courseName,
          admissionDate: updatedAdmission.admissionDate,
          admissionFee: updatedAdmission.admissionFee,
        }
      });

      return res.status(200).json({
        message: "Admission updated",
        updateAdmission: updatedAdmission
      });
    }

    // 2) batchNumber is changing => ensure target batch exists
    const newBatch = await Batch.findOne({ batchNumber: newBatchNumber });
    if (!newBatch) {
      return res.status(404).json({ message: "Target batch not found" });
    }

    //  Capacity check (prevents overfilling)
    const assigned = newBatch.assignedStudentCount ?? 0;
    const target = newBatch.targetStudent ?? 0;
    if (target > 0 && assigned >= target) {
      return res.status(400).json({ message: "Sorry! This batch is full." });
    }

    // 3) Update admission
    const updatedAdmission = await Admission.findOneAndUpdate(
      { _id: admissionId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAdmission) {
      return res.status(500).json({ message: "Failed to update admission" });
    }

    // 4) Increment new batch count
    const updatedNewBatch = await Batch.findOneAndUpdate(
      { batchNumber: newBatchNumber },
      { $inc: { assignedStudentCount: 1 } },
      { new: true }
    );

    if (!updatedNewBatch) {
      await Admission.findByIdAndUpdate(admissionId, { batchNumber: oldBatchNumber }).catch(() => {});
      return res.status(500).json({ message: "Failed to increment new batch count; rolled back admission" });
    }

    // 5) Decrement old batch count (if existed)
    let updatedOldBatch = null;
    if (oldBatchNumber) {
      updatedOldBatch = await Batch.findOneAndUpdate(
        { batchNumber: oldBatchNumber, assignedStudentCount: { $gt: 0 } },
        { $inc: { assignedStudentCount: -1 } },
        { new: true }
      );

      if (!updatedOldBatch) {
        // compensation
        await Batch.findOneAndUpdate(
          { batchNumber: newBatchNumber },
          { $inc: { assignedStudentCount: -1 } }
        ).catch(() => {});
        await Admission.findByIdAndUpdate(admissionId, { batchNumber: oldBatchNumber }).catch(() => {});

        return res.status(500).json({
          message: "Failed to decrement old batch count; changes rolled back."
        });
      }
    }

    //  6) Sync Student after successful admission change
    const nextStatus = updatedAdmission.status || "Assigned";
    await Student.findByIdAndUpdate(studentId, {
      $set: {
        status: nextStatus,
        batchNumber: updatedAdmission.batchNumber,
        courseId: updatedAdmission.courseId,
        courseName: updatedAdmission.courseName,
        admissionDate: updatedAdmission.admissionDate,
        admissionFee: updatedAdmission.admissionFee,
      }
    });

    return res.status(200).json({
      message: "Admission updated and batch counts adjusted successfully",
      updateAdmission: updatedAdmission,
      newBatch: { batchNumber: newBatchNumber, assignedStudentCount: updatedNewBatch.assignedStudentCount },
      oldBatch: updatedOldBatch ? { batchNumber: oldBatchNumber, assignedStudentCount: updatedOldBatch.assignedStudentCount } : null
    });

  } catch (err) {
    console.error("Error in updateAdmission:", err);
    return res.status(500).json({ message: "Some Internal Error", error: err.message });
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