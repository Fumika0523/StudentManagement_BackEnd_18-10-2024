const Course = require('../model/courseModel')

const addCourse = async(req,res)=>{
    //console.log(req.body)
    //console.log(req.token)
    try{
        // console.log(req.token)
        const courseDetail = new Course(req.body)
        if(!courseDetail){
            res.status(401).send({message:"Unable to add your Course details"})
        }await courseDetail.save()
        res.status(200).send({courseDetail:courseDetail,message:"Your Course detail has successfully been added!"})
    }catch(e){
        res.status(500).send({message:"Some Internal Error"})
    }
}

const allCourse = async(req,res)=>{
    //with auth
    try{
        console.log(req.token)
        const getCourseData = await Course.find()
        if(!getCourseData){
            res.send({message:"The Course Data cannot be found"})
        }res.send({courseData:getCourseData})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }}

const updateCourse = async(req,res)=>{
    const updateCourse = await Course.findOneAndUpdate({_id:req.params.id},req.body,{new:true,runValidators:true})
    try{
        console.log(updateCourse)
        if(!updateCourse){
            return res.send({message:"Cannot update the Course, please check again"})
        }
        res.send({message:"The course has been successfully updated",updateCourse})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }    
}

const deleteCourse = async(req,res)=>{
    try{
        console.log("Delete Course by ID", req.params.id)
        const deleteCourse = await Course.findOneAndDelete({
            _id:req.params.id
        })
        if(!deleteCourse){
           return res.send({message:"Course Not Found"})
        }
        res.send({message:'Course has been deleted successfully',deleteCourse})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }
}

module.exports = { addCourse,allCourse, updateCourse, deleteCourse  }