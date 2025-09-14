const Admission = require('../model/admissionModel')
const Student = require('../model/studentModel')
const Batch = require('../model/batchModel')


// need to update batch number,
const addAdmission = async (req, res) => {
  try {
    //prints the authenticated user
   // console.log("Add Admission", req.user);
    const { admissionDate, batchNumber, studentId } = req.body;

    // Check if batchNumber can be found in Batch collection, otherwise show the error
    const batch = await Batch.findOne({ batchNumber });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // const dateObj = new Date(admissionDate); creates a JavaScript Date object by parsing admissionDate. dateObj is then a date/time object you can query (year, month, day, timestamp, etc.) or store.
    const dateObj = new Date(admissionDate);
       // console.log("dateObj",dateObj)
    const year = dateObj.getFullYear();
        //console.log("year",year)
    const month = dateObj.toLocaleString("default", { month: "short" });
         //console.log("month",month)

    // Create admission detail
    const admissionDetail = new Admission({
      ...req.body,
      studentId,
      admissionYear: year,
      admissionMonth: month,
      batchNumber: batch.batchNumber, // use matched batch
    });
    admissionDetail.admissionId = admissionDetail._id;
    console.log("admissionDetail",admissionDetail)
    // Find single student and update
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.courseId = admissionDetail.courseId;
    // student.admissionFee = admissionDetail.admissionFee;
    student.courseFee = admissionDetail.admissionFee;
    student.courseName = admissionDetail.courseName;
    student.admissionDate = admissionDetail.admissionDate;

    await student.save();

    // Increment assignedStudentCount in batch
    batch.assignedStudentCount = (batch.assignedStudentCount || 0) + 1;
    await batch.save();

    // Save the admission
    await admissionDetail.save();

    res.status(200).json({
      admissionDetail,
      batchAssignedStudentCount: batch.assignedStudentCount,
      message: "Admission added and batch count updated successfully!",
    });
  } catch (e) {
    console.error("Error in addAdmission:", e);
    res.status(500).json({ message: "Some Internal Error", error: e.message });
  }
};


const getAllAdmission = async(req,res)=>{
    // With Auth 
     try{
     //   console.log(req.token)
        const getAdmissionData = await Admission.find()
        if(!getAdmissionData){
            res.send({message:"The Admission Data canot be found"})
        }res.send({admissionData:getAdmissionData})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }
    }

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
    // 1) Find a current admission
    const currentAdmission = await Admission.findById(admissionId);
    if (!currentAdmission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    const oldBatchNumber = currentAdmission.batchNumber; // may be undefined/null
    const newBatchNumber = req.body.batchNumber; // may be undefined (not changing)

    // 2) If batchNumber is not changing (or not provided), just update admission normally
    if (!req.body.batchNumber || newBatchNumber === oldBatchNumber) {
      const updatedAdmission = await Admission.findOneAndUpdate(
        { _id: admissionId },
        req.body,
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        message: "Admission updated",
        updateAdmission: updatedAdmission
      });
    }

    // 3) batchNumber is changing -> ensure target (new) batch exists
    const newBatch = await Batch.findOne({ batchNumber: newBatchNumber });
    if (!newBatch) {
      return res.status(404).json({ message: "Target batch not found" });
    }

    // 4) Update admission first (so we have the modified admission doc to return)
    const updatedAdmission = await Admission.findOneAndUpdate(
      { _id: admissionId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAdmission) {
      return res.status(500).json({ message: "Failed to update admission" });
    }

    // 5) Increment the new batch assignedStudentCount atomically
    const updatedNewBatch = await Batch.findOneAndUpdate(
      { batchNumber: newBatchNumber },
      //$inc is a MongoDB update operator that adds the specified value to a numeric field.
      { $inc: { assignedStudentCount: 1 } },
      { new: true }
    );

    if (!updatedNewBatch) {
      // rollback: revert admission to old batchNumber
      await Admission.findByIdAndUpdate(admissionId, { batchNumber: oldBatchNumber }).catch(err =>
        console.error("Rollback: failed to revert admission", err)
      );
      return res.status(500).json({ message: "Failed to increment new batch count; rolled back admission" });
    }

    // 6) Decrement the old batch assignedStudentCount (if there was an old batch)
    let updatedOldBatch = null;
    if (oldBatchNumber) {
      // Use filter assignedStudentCount > 0 to prevent negative counts — treat failure as an inconsistency
      updatedOldBatch = await Batch.findOneAndUpdate(
        //“only match if assignedStudentCount is greater than 0.”
        { batchNumber: oldBatchNumber, assignedStudentCount: { $gt: 0 } },
        { $inc: { assignedStudentCount: -1 } },
        { new: true }
      );

      if (!updatedOldBatch) {
        // Compensate: decrement the increment we did on the new batch, then revert admission
        await Batch.findOneAndUpdate(
          { batchNumber: newBatchNumber },
          { $inc: { assignedStudentCount: -1 } }
        ).catch(err => console.error("Compensation: failed to decrement new batch", err));

        await Admission.findByIdAndUpdate(admissionId, { batchNumber: oldBatchNumber }).catch(err =>
          console.error("Rollback: failed to revert admission", err)
        );

        return res.status(500).json({
          message: "Failed to decrement old batch count; changes were rolled back. Please check batch counts for consistency."
        });
      }
    }

    // 7) Success response: admission updated & batch counts adjusted
    return res.status(200).json({
      message: "Admission updated and batch counts adjusted successfully",
      updateAdmission: updatedAdmission,
      newBatch: { batchNumber: newBatchNumber, assignedStudentCount: updatedNewBatch.assignedStudentCount },
      oldBatch: updatedOldBatch ? { batchNumber: oldBatchNumber, assignedStudentCount: updatedOldBatch.assignedStudentCount } : null
    });

  } catch (err) {
    console.error("Error in updateAdmission:", err);
    // Best-effort cleanup could be added here, but avoid complex retry logic inside catch
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