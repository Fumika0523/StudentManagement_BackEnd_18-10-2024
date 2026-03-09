const Student = require('../model/studentModel')
const express = require('express')
const router = express.Router()
const bcrypt = require ('bcryptjs')
const sharp = require('sharp')
const {auth,authorizationRole} = require ('../middleware/auth')
const {signIn, getAllStudent,singleStudent ,updateStudent,deleteStudent, addStudent} = require('../controllers/studentControllers')
const multer=require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

//POST
router.post('/registerstudent',addStudent)

//Signed In
router.post('/loginstudent',signIn)

//get (All)
router.get('/allstudent',getAllStudent)

//get 1 Student
router.get('/student/:id',auth,singleStudent)

//update
router.put('/updatestudent/:id',auth,updateStudent)

//delete
router.delete('/deletestudent/:id',auth,authorizationRole(["admin", "staff"]),deleteStudent)

// router.get('/get-file',auth,authorizationRole(["admin", "staff"]),getFile)

// router.post('student/upload-file', upload.single('/file'),auth,authorizationRole(["admin", "staff"]),uploadFile)


module.exports= router