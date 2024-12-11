const express = require('express')
const Batch = require('../model/batchNumberModel')
const router = express.Router()

//get
router.get('/allbatch',async(req,res)=>{
//without Auth
    const getAllBatch = await Batch.find()
    res.send(getAllBatch)
})

//post
router.post('/addbatch',async(req,res)=>{
    try{
        const batchDetail = new Batch({
            ...req.body,
        })
        if(!batchDetail){
            res.status(401).send({message:"Unable to add your Bathc"})
        }await batchDetail.save()
        res.status(200).send({batchDetails:batchDetail,message:"Your batch detail has been added!"})
    }catch(e){
        res.status(500).send({message:"Some Internal Error"})
    }
})

//edit

//delete


//10 batches > get request and view



module.exports = router