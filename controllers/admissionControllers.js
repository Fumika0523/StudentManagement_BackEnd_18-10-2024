const Admission = require('../model/admissionModel')


const addAdmission = async(req,res)=>{
    try{
    //object destructuring
        console.log("Add Addmission Route")
        console.log(req.user)
        const {admissionDate} = req.body
        const dateObj = new Date(admissionDate)
        const year = dateObj.getFullYear(); //admissiondate year
        const month = dateObj.toLocaleString('default',{month:'short'}) //get month always start 0, thats why plus 1
        const admissionDetail = new Admission ({
            ...req.body, // makingg the copy of req. body
             studentId:req.body.studentId, // get 1 single student.
            admissionYear:year,
            admissionMonth:month,
        })
        console.log(req.body.studentId) 
        admissionDetail.admissionId = admissionDetail._id;
        //req.studentId, student.findById(req.studentId) >>get 1 single student >>>> object student.courseName === req.courseName >> student.courseId == req.courseId, >>> await student.save() >> save it to the DB, courseFee
        const getStudent = await Student.findById(req.body.studentId) // getting 1 student id
        console.log(getStudent)
        //courseName
        getStudent.courseName = admissionDetail.courseName
        //preferredCourses
        // getStudent.preferredCourses = admissionDetail.preferredCourses
        //courseId
        getStudent.courseId = admissionDetail.courseId
        //admissionId
        // getStudent.admissionId=admissionDetail.admissionId
        //admissionFee
        getStudent.admissionFee = admissionDetail.admissionFee,
        //courseFee
        getStudent.courseFee = admissionDetail.courseFee
       
        //admissionDate.
        getStudent.admissionDate = admissionDetail.admissionDate
        await getStudent.save() // saving to 1 single student
        console.log(admissionDetail)
        if(!admissionDetail){
            res.status(401).send({message:"Unabel to contact to admission"})
        }
        await admissionDetail.save()      
        res.status(200).send({
            admissionDetail:admissionDetail,
            message:"Your Admission detail has successfully been sent!"
        })
  }catch(e){
           res.send({"message":"Some Internal Error"})
  }
}

const getAllAdmission = async(req,res)=>{
    // With Auth << TEST
     try{
        console.log(req.token)
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

const updateAdmission = async(req,res)=>{
    //Without Auth
    const updateAdmission = await Admission.findOneAndUpdate({_id:req.params.id},req.body,{new:true, runValidators:true})
    try{
        console.log(updateAdmission)
        if(!updateAdmission){
        return res.send({message:"Can't update the Admission, please check again"})
         }
         res.send({message:"The Admission has been successfully updated",updateAdmission})
    }catch(e){
        res.send({message:"Some Internal Error Occur"})
    }
}

const deletAdmission = async(req,res)=>{
     try{
        console.log("Delete Admission by ID",req.params.id)
        const deleteAdmission = await Admission.findOneAndDelete({
            _id:req.params.id
        })
        if(!deleteAdmission){
            res.send({message:"Admission Not Found"})
        }
        res.send({message:"Admission has been deleted successfully",deleteAdmission})
        }catch(e){
            res.send({message:"Some Internal Error"})
        }
}

module.exports= {addAdmission, getAllAdmission, getSingleAdmission, updateAdmission, deletAdmission}