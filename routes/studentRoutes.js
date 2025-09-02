const Student = require('../model/studentModel')
const express = require('express')
const router = express.Router()
const bcrypt = require ('bcryptjs')
const sharp = require('sharp')
const {auth} = require ('../middleware/auth')
const {signIn, getAllStudent,singleStudent ,updateStudent,deleteStudent} = require('../controllers/studentControllers')

//POST
//Add student
// router.post('/registerstudent',async(req,res)=>{
//     // try{
//     let student = await Student.findOne({
//         $or:[
//             {email:req.body.email},
//             {phoneNumber:req.body.phoneNumber}
//         ]
//     })
// console.log(student)
// console.log(req.body)
// if(student){
//     console.log("Student is found",req.body.email)
//     return res.send("Student Already Exist. Please Log-in")
// }
// //password hashing
// const salt = await bcrypt.genSalt(10)
// const hashedPassword = await bcrypt.hash(req.body.password,salt)// using this round, combined with a password >> create a new pw
// const studentData = new Student({
//     ...req.body,
//     password:hashedPassword
// })
// await studentData.save()
// res.send({student:studentData,message:"Successfully registred"})
//     // }catch(e){
//     //     res.send("Some Internal Error Occurred")
//     // }
//     })

//Signed In
router.post('/loginstudent',signIn)

//get (All)
router.get('/allstudent',auth,getAllStudent)

//get 1 Student
router.get('/student/:id',auth,singleStudent)

//update
router.put('/updatestudent/:id',updateStudent)

//delete
router.delete('/deletestudent/:id',deleteStudent)

    module.exports= router