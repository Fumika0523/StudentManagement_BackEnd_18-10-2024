const express = require('express')
const Batch = require('../model/batchNumberModel')
const router = express.Router()
const auth = require('../middleware/auth')
//get
router.get('/allbatch',auth,async(req,res)=>{
//without Auth
    // const getAllBatch = await Batch.find()
    // res.send(getAllBatch)


//With AUth
try{
    console.log(req.token)
    const getBatchData = await Batch.find()
    if(!getBatchData){
        res.send({message:"The Student Data canot be found"})
    }res.send({batchData:getBatchData})
}catch(e){
    res.send({message:"Some Internal Error"})
}
})

//post
router.post('/addbatch',auth,async(req,res)=>{
    // try{
        console.log(req.token)
        const batchDetail = new Batch({
            ...req.body,
        })
        if(!batchDetail){
            res.status(401).send({message:"Unable to add your Bathc"})
        }await batchDetail.save()
        res.status(200).send({batchDetails:batchDetail,message:"Your batch detail has been added!"})
    // }catch(e){
    //     res.status(500).send({message:"Some Internal Error"})
    // }
})
//update
router.put('/updatebatch/:id',async(req,res)=>{
    const updateBatch = await Batch.findOneAndUpdate({_id:req.params.id},req.body,{new:true, runValidators:true})
    try{
        console.log(updateBatch)
        if(!updateBatch){
        return res.send({message:"Can't update the Batch, please check again"})
         }
         res.send({message:"The Batch has been successfully updated",updateBatch})
    }catch(e){
        res.send({message:"Some Internal Error Occur"})
    }
})

//delete
router.delete('/deletesbatch/:id',async(req,res)=>{
    // try{
        console.log("Delete Batch by ID",req.params.id)
        const deleteBatch = await Batch.findOneAndDelete({
            _id:req.params.id
        })
        if(!deleteBatch){
            res.send({message:"Batch Not Found"})
        }
        res.send({message:"Batch has been deleted successfully",deleteBatch})
        // }catch(e){
        //     res.send({message:"Some Internal Error"})
        // }
})
//10 batches > get request and view



module.exports = router