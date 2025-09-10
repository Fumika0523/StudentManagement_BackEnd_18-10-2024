const Course = require('../model/courseModel')
const express = require('express')
const router = express.Router()
const {auth,authorizationRole} = require('../middleware/auth')
const {addCourse, allCourse, updateCourse, deleteCourse} = require('../controllers/courseControllers')

//add
router.post('/addcourse',auth,authorizationRole("admin"),addCourse)

//get (All)
router.get('/allcourse',auth,authorizationRole("admin"),allCourse)

//UPDATE
router.put('/updatecourse/:id',auth,authorizationRole("admin"),updateCourse)

//DELETE
router.delete('/deletecourse/:id',auth,authorizationRole("admin"),deleteCourse)


module.exports = router