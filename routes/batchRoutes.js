const express = require('express')
const Batch = require('../model/batchModel')
const router = express.Router()
const { auth, authorizationRole } = require("../middleware/auth");
const { getAllBatches, addBatch, nextBatchNumber, updateBatch, deleteBatch,approveBatch,declineBatch,  sendApprovalBatch,getSingleBatch} = require("../controllers/batchControllers");

//get
router.get('/allbatch',auth,authorizationRole(["admin", "staff"]),getAllBatches)

//post
router.post("/addbatch",auth,authorizationRole(["admin", "staff"]), addBatch);

// get next batch number
router.get("/nextbatchno",auth,authorizationRole(["admin", "staff"]), nextBatchNumber)

//update
router.put('/updatebatch/:id',auth,authorizationRole(["admin", "staff"]),updateBatch)

//delete
router.delete('/deletesbatch/:id',auth,authorizationRole(["admin", "staff"]), deleteBatch)

// send approval request (staff)
router.post(
  "/batch/send-approval-request",
  auth,
  authorizationRole(["admin", "staff"]),
  sendApprovalBatch
);

router.patch("/approve/:id", auth, authorizationRole(["admin"]), approveBatch);

router.patch("/decline/:id", auth, authorizationRole(["admin"]), declineBatch);

router.get("/batch/:id",auth,authorizationRole(["admin"]),getSingleBatch)

module.exports = router