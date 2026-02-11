const Student = require('../model/studentModel')
const bcrypt = require ('bcryptjs')
const sharp = require('sharp')
const multer=require('multer')
const storage = multer.memoryStorage() //buffer
const upload = multer({ storage: storage })
const csv=require('csvtojson')
const fs=require("fs")
const path=require("path")

const addStudent = async(req,res)=>{
//try{
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
}

const signIn = async(req,res)=>{
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
}

const getAllStudent = async(req,res)=>{
    try{
        //console.log(req.token)
        const getStudentData = await Student.find()
        if(!getStudentData){
            res.send({message:"The Student Data cannot b found"})
        }res.send({studentData:getStudentData})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }
}

const singleStudent = async(req,res)=>{
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
}

const updateStudent = async(req,res)=>{
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
}

const deleteStudent = async(req,res)=>{
    try{
        console.log("Delete Student by ID",req.params.id)
        const deleteStudent = await Student.findOneAndDelete({
            _id:req.params.id
        })
        if(!deleteStudent){
            res.send({message:"Student Not Found"})
        }
        res.send({message:"Student has been deleted successfully",deleteStudent})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }
}

//multer >> upload option in nodejs app
//csvtojson >> convert csv data to json
// xlsv >> read ur excel

//npm i multer
// npm i csvtojson
//npm i xlsx
//memory storage

// CSV

// const getFile = async(req,res)=>{
//     res.send("Testing.. student module.. get File")
// }

// const uploadFile = async(req,res)=>{
//     try{
//         let data = []
//         const file = req.file // instead of req.body
//         //error handler
//         // file should end with .csv / excel
//         if(file.originalname.endWith(".csv")){
//         //csv to json //
//         data=await csv().fromFile(file.buffer.toString()) //single single json data -> {} {} {} >> data [{},{}]
//         }
//         if(file.originalname.endWith("xlsx")){
        
//         }else{
//             res.send("Please upload a csv file")
//         }
//     }catch(e){
//         res.send("Some Internal Error",e)
//     }
// }

// fs module >> file system >> work with file
// path module >> 

module.exports = {signIn, getAllStudent,singleStudent, updateStudent,deleteStudent, addStudent,}