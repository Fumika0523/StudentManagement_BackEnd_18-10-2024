const Student = require('../model/studentModel')
const express = require('express')
const router = express.Router()
const bcrypt = require ('bcryptjs')
const sharp = require('sharp')
const {auth,authorizationRole} = require ('../middleware/auth')
const {signIn, getAllStudent,singleStudent ,updateStudent,deleteStudent, addStudent} = require('../controllers/studentControllers')

//POST

router.post('/registerstudent',addStudent)

//Signed In
router.post('/loginstudent',signIn)

//get (All)
router.get('/allstudent',auth,authorizationRole(["admin", "staff"]),getAllStudent)

//get 1 Student
router.get('/student/:id',auth,authorizationRole(["admin", "staff"]),singleStudent)

//update
router.put('/updatestudent/:id',auth,authorizationRole(["admin", "staff"]),updateStudent)

//delete
router.delete('/deletestudent/:id',auth,authorizationRole(["admin", "staff"]),deleteStudent)

    module.exports= router