const express = require('express')
const Batch = require('../model/batchModel')
const router = express.Router()
const { auth, authorizationRole } = require("../middleware/auth");
const { getAllBatches, addBatch, nextBatchNumber, updateBatch, deleteBatch } = require("../controllers/batchControllers");

//get
router.get('/allbatch',auth,authorizationRole("admin"),getAllBatches)

//post
router.post("/addbatch",auth,authorizationRole("admin"), addBatch);

// get next batch number
router.get("/nextbatchno",auth,authorizationRole("admin"), nextBatchNumber)

//update
router.put('/updatebatch/:id',auth,authorizationRole("admin"),updateBatch)

//delete
router.delete('/deletesbatch/:id',auth,authorizationRole("admin"), deleteBatch)


module.exports = router