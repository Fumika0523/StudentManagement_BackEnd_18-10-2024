const express = require('express')
const Batch = require('../model/batchNumberModel')
const router = express.Router()
const { auth } = require("../middleware/auth");
const { getAllBatches, addBatch, nextBatchNumber, updateBatch, deleteBatch } = require("../controllers/batchControllers");

//get
router.get('/allbatch',auth,getAllBatches)

//post
router.post("/addbatch", auth, addBatch);

// get next batch number
router.get("/nextbatchno", auth, nextBatchNumber)

//update
router.put('/updatebatch/:id',updateBatch)

//delete
router.delete('/deletesbatch/:id', deleteBatch)


module.exports = router