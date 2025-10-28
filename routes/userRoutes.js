const User = require('../model/userModel')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const sharp = require('sharp')
const {auth, authorizationRole} = require ('../middleware/auth')
const Student = require('../model/studentModel')
const {signUp,signIn, getProfile, updateProfile, deleteProfile,dashboard,payment, uploadProfilePhoto} = require('../controllers/userController')

router.get("/test",authorizationRole,(req,res)=>{
    console.log("test")
})

// User can see everything, student can access only specific area
//POST REQUEST
router.post('/signup',signUp);

//Sign In
router.post('/signin',signIn)

//UPDATE the profile photo
router.post('/users/profile/upload/image', auth, uploadProfilePhoto)

// GET
router.get('/users/profile',auth,getProfile)

//UPDATE
router.put('/users/profile',auth,updateProfile)

//DELETE
router.delete('/users/profile',auth,authorizationRole(["admin" , "staff"]),deleteProfile)

//Sample
router.get('/dashboard',auth,authorizationRole("admin" ),dashboard)


router.get('/payment',auth,authorizationRole("student"),payment)


module.exports = router