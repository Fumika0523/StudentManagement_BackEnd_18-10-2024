const express = require('express')
const Batch = require('../model/batchModel')
const router = express.Router()
const { auth, authorizationRole } = require("../middleware/auth");
const { getAllBatches, addBatch, nextBatchNumber, updateBatch, deleteBatch } = require("../controllers/batchControllers");

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


module.exports = router