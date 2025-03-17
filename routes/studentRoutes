const Student = require('../model/studentModel')
const express = require('express')
const router = express.Router()
const bcrypt = require ('bcryptjs')
const sharp = require('sharp')
const auth = require ('../middleware/auth')

//POST
//Add student
router.post('/registerstudent',async(req,res)=>{
    // try{
    let student = await Student.findOne({
        $or:[
            {email:req.body.email},
            {phoneNumber:req.body.phoneNumber}
        ]
    })
console.log(student)
console.log(req.body)
if(student){
    console.log("Student is found",req.body.email)
    return res.send("Student Already Exist. Please Log-in")
}
//password hashing
const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(req.body.password,salt)// using this round, combined with a password >> create a new pw
const studentData = new Student({
    ...req.body,
    password:hashedPassword
})
await studentData.save()
res.send({student:studentData,message:"Successfully registred"})
    // }catch(e){
    //     res.send("Some Internal Error Occurred")
    // }
    })

//Signed In
router.post('/loginstudent',async(req,res)=>{
    try{
        let student = await Student.findOne({
            username:req.body.username
        })
        if(!student){
            return res.status(400).send({
                message:"username Not Found"
            })
        }
        //Checking by student with pw
         const isMatch = await bcrypt.compare(req.body.password,student.password)
        console.log(isMatch)
        if(!isMatch){
            return res.status(400).send({
                message:"Please Check Your Password"
             })}
            if(isMatch && student){
                const token = await student.generateAuthToken()
                return res.status(200).send({
                    message:"You have successfully Loged in!",
                    student:student,
                    token:token
                })
            }
     }catch(e){
        res.status(500).send({
            message:"Some internal error"
        })
    }
})

//get (All)
router.get('/allstudent',auth,async(req,res)=>{
    // Without Auth
    // const getAllStudent = await Student.find()
    // res.send(getAllStudent)

    //With Auth
    try{
        console.log(req.token)
        const getStudentData = await Student.find()
        if(!getStudentData){
            res.send({message:"The Student Data cannot b found"})
        }res.send({studentData:getStudentData})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }
})

//get 1 Student
router.get('/student/:id',auth,async(req,res)=>{
    // Without Auth
    // const getAllStudent = await Student.find()
    // res.send(getAllStudent)
// console.log(req.user)
    //With Auth
    try{
    console.log(req.params.id)
    const getStudent = await Student.findById(req.params.id)
    if(!getStudent){
        res.send({message:"The student cant be found"})
    }
    else{res.send({StudentData:getStudent})
}
}catch(e){
    res.send({message:"Some Internal Error"})
}
})

// const studentById = await Student.find().populate("courseName")
// if(!studentById){
//     res.send({message:"Student data is not found"})
// }res.send({studentData:studentById})


//update
router.put('/updatestudent/:id',async(req,res)=>{
    const updateStudent = await Student.findOneAndUpdate({_id:req.params.id},req.body,{new:true, runValidators:true})
    try{
        console.log(updateStudent)
        if(!updateStudent){
        return res.send({message:"Can't update the Student, please check again"})
         }
         res.send({message:"The Student has been successfully updated",updateStudent})
    }catch(e){
        res.send({message:"Some Internal Error Occur"})
    }
})

//delete
router.delete('/deletestudent/:id',async(req,res)=>{
    // try{
        console.log("Delete Student by ID",req.params.id)
        const deleteStudent = await Student.findOneAndDelete({
            _id:req.params.id
        })
        if(!deleteStudent){
            res.send({message:"Student Not Found"})
        }
        res.send({message:"Student has been deleted successfully",deleteStudent})
        // }catch(e){
        //     res.send({message:"Some Internal Error"})
        // }
})

    module.exports= router