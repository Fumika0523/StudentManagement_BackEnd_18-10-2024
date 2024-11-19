const Course = require('../model/courseModel')
const express = require('express')
const router = express.Router()


//add
router.post('/addcourse',async(req,res)=>{
    try{
        const courseDetail = new Course({
            ...req.body,
        })
        if(!courseDetail){
            res.status(401).send({message:"Unable to add your Course details"})
        }await courseDetail.save()
        res.status(200).send({courseDetail:courseDetail,message:"Your Course detail has successfully been added!"})
    }catch(e){
        res.status(500).send({message:"Some Internal Error"})
    }
})


//get (All)
router.get('/allcourse',async(req,res)=>{
    //Without Auth
    const getAllCourse = await Course.find()
    res.send(getAllCourse)
})

//DELETE
router.delete('/deletecourse/:id',async(req,res)=>{
    try{

    }catch(e){
        res.send({message:"Some Internal Error"})
    }
})

module.exports = router