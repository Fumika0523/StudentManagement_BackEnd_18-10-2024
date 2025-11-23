const sendEmail = require("../utils/sendEmail");
const Batch = require("../model/batchModel");
const User = require("../model/userModel");

const getAllBatches = async (req,res) => {
 try{
    //console.log(req.token)
    const getBatchData = await Batch.find()
    if(!getBatchData){
        res.send({message:"The Student Data canot be found"})
    }res.send({batchData:getBatchData})
}catch(e){
    res.send({message:"Some Internal Error"})
}
}

// increment operator
// const addBatch = async (req, res) => {
//   try {
//     const batchDetail = new Batch(req.body);
//     if(!batchDetail){
//       res.status(401).send({message:"Unable to add your batch"})
//      }
//      await batchDetail.save()
//     res.status(200).send({batchDetail:batchDetail,message:"added"})
//   } catch (e) {
//     console.error("Error adding batch:", e);
//     res.status(500).send({ message: "Some Internal Error" });
//   }
// }

const addBatch = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    // Find the last batch for this year
    const lastBatch = await Batch.findOne({ batchNumber: { $regex: `^${year}-` } })
                                 .sort({ seq: -1 });

    let nextSeq = 1; // default for first batch
    if (lastBatch) {
      nextSeq = lastBatch.seq + 1;
    }

    const batchNumber = `${year}-${String(nextSeq).padStart(4, '0')}`;

    // Add the batch number and sequence to req.body
    const batchDetail = new Batch({
      ...req.body,
      batchNumber,
      seq: nextSeq
    });

    await batchDetail.save();

    res.status(200).send({
      batchDetail,
      message: "Batch added successfully!"
    });

  } catch (e) {
    console.error("Error adding batch:", e);
    res.status(500).send({ message: "Some Internal Error" });
  }
};

// const nextBatchNumber = async (req, res) => {
//   try {
//       const year = new Date().getFullYear()
//       const generateSequence = await Batch.findOneAndUpdate(
//             {batchNumber:`batch-${year}`}, //dummy trick
//             {$inc:{seq:1}},
//             {new:true,upsert:true}
//         )
//       // console.log(String(test.seq).padStart(4,"0"))
//       //  console.log(test.seq,text.batchNumber)
//       //  console.log(`${year}-` +String(generateSequence.seq).padStart(4,"0"))
//        const newBatch= `${year}-` +String(generateSequence.seq).padStart(4,"0")
//        console.log("newBatch",newBatch)
//        res.status(201).send({message:"New Batch successfully generated! ",newBatch })
//   } catch (err) {
//     console.error("Error fetching next batch number:", err);
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// }

const nextBatchNumber = async (req, res) => {
  try {
    const year = new Date().getFullYear();

    // Find the last batch of this year
    const lastBatch = await Batch.findOne({ batchNumber: { $regex: `^${year}-` } })
                                 .sort({ seq: -1 });

    let nextSeq = 1; // default sequence for first batch
    if (lastBatch) {
      nextSeq = lastBatch.seq + 1;
    }

    const newBatch = `${year}-${String(nextSeq).padStart(4, '0')}`;

    res.status(200).send({
      message: "Next batch number generated successfully!",
      newBatch
    });

  } catch (err) {
    console.error("Error fetching next batch number:", err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!batch) {
      return res.status(404).send({
        message: "Can't update the Batch, please check the ID again",
      });
    }

    res.status(200).send({
      message: "The Batch has been successfully updated",
      batch,
    });
  } catch (e) {
    console.error("Error updating Batch:", e);
    res.status(500).send({ message: "Some Internal Error Occurred" });
  }
};

const deleteBatch = async(req,res)=>{
    try{
        console.log("Delete Batch by ID",req.params.id)
        const deleteBatch = await Batch.findOneAndDelete({
            _id:req.params.id
        })
        if(!deleteBatch){
            res.send({message:"Batch Not Found"})
        }
        res.send({message:"Batch has been deleted successfully",deleteBatch})
        }catch(e){
            res.send({message:"Some Internal Error"})
        }
}

const approveBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).send({ message: "Batch not found" });

    const adminUser = req.user; // from auth middleware

    // 🔒 PROTECT AGAINST DOUBLE APPROVAL (ADD THIS)
    if (batch.approvalStatus === "approved" || batch.approvalStatus === "declined") {
      return res
        .status(400)
        .send({ message: "This approval link is no longer active." });
    }

    // Update batch
    const updated = await Batch.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvalStatus: "approved",
        approvedBy: adminUser.username,
        approvedAt: new Date()
      },
      { new: true }
    );

    // Send email to staff who requested
    if (batch.requestedByEmail) {
      await sendEmail({
        to: batch.requestedByEmail,
        subject: "Your Batch Has Been Approved",
        html: `
          <p>Your batch <strong>${batch.batchNumber}</strong> has been approved by <strong>${adminUser.username}</strong>.</p>
          <p>Please complete the batch.</p>
          <p><a href="${process.env.FRONTEND_URL}/batchData">Go to Batch Page</a></p>
        `
      });
    }

    res.send({ message: "Batch approved", batch: updated });

  } catch (e) {
    console.log("Approve error:", e);
    res.status(500).send({ message: "Internal error approving batch" });
  }
};

const declineBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).send({ message: "Batch not found" });

    const adminUser = req.user;

    if (batch.approvalStatus === "approved" || batch.approvalStatus === "declined") {
  return res
    .status(400)
    .send({ message: "This approval link is no longer active." });
}


    const updated = await Batch.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        approvalStatus: "declined"
      },
      { new: true }
    );

    // Notify staff
    if (batch.requestedByEmail) {
      await sendEmail({
        to: batch.requestedByEmail,
        subject: "Your Batch Approval Request Was Declined",
        html: `
          <p>Your batch <strong>${batch.batchNumber}</strong> was declined by <strong>${adminUser.username}</strong>.</p>
        `
      });
    }

    res.send({ message: "Batch declined", batch: updated });

  } catch (e) {
    console.log("Decline error:", e);
    res.status(500).send({ message: "Internal error declining batch" });
  }
};


const sendApprovalBatch = async (req, res) => {
  try {
    const { batchId, username } = req.body;

    // Find staff user who is requesting
    const staffUser = await User.findOne({ username });
    if (!staffUser) {
      return res.status(400).send({ message: "Requesting staff user not found" });
    }

    // Update batch
    const batch = await Batch.findByIdAndUpdate(
      batchId,
      {
        approvalStatus: "pending",
        requestedBy: username,
        requestedByEmail: staffUser.email
      },
      { new: true }
    );

    // Find all admins
    const admins = await User.find({ role: "admin" });
    if (!admins.length) {
      return res.status(400).send({ message: "No admin users found" });
    }

    const adminEmails = admins.map(a => a.email);

    // Modern email HTML
    const emailHTML = `
<div style="
  font-family: Arial, sans-serif;
  max-width: 480px;
  margin: auto;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
">
  
  <h2 style="color: #1e40af; text-align: center;">Batch Approval Request</h2>

  <p>Hello Admin,</p>

  <p>
    <strong>${username}</strong> has requested approval for:
  </p>

  <div style="
    padding: 12px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    margin-top: 8px;
  ">
    <p style="margin: 0;">
      <strong>Batch:</strong> ${batch.batchNumber}<br/>
      <strong>Course:</strong> ${batch.courseName}<br/>
      <strong>Requested At:</strong> ${new Date().toLocaleString()}
    </p>
  </div>

  <p style="margin-top: 16px;">Please sign in to review this request:</p>

  <a href="${process.env.FRONTEND_URL}/login?redirect=/batch/approve/${batchId}"
     style="
      display: block;
      width: 100%;
      padding: 12px 0;
      background-color: #2563eb;
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin-top: 12px;
     ">
    Review Request
  </a>

  <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
    If you did not expect this email, you may safely ignore it.
  </p>

</div>
`;

    // Send emails to all admins
    for (const email of adminEmails) {
      await sendEmail({
        to: email,
        subject: "Batch Approval Request",
        html: emailHTML
      });
    }

    res.send({ message: "Approval request sent." });

  } catch (e) {
    console.log("ERROR sending approval:", e);
    res.status(500).send({ message: "Internal error sending approval" });
  }
};

module.exports = {
  getAllBatches,
  addBatch,
  nextBatchNumber,
  updateBatch,
  deleteBatch,
  approveBatch,
  declineBatch,
  sendApprovalBatch
};
