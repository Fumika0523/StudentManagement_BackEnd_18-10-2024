const Course = require('../model/courseModel')
const express = require('express')
const router = express.Router()
const {auth,authorizationRole} = require('../middleware/auth')
const {addCourse, allCourse, updateCourse, deleteCourse} = require('../controllers/courseControllers')

//add
router.post('/addcourse',authorizationRole("admin"),addCourse)

//get (All)
router.get('/allcourse',authorizationRole("admin"),allCourse)

//UPDATE
router.put('/updatecourse/:id',authorizationRole("admin"),updateCourse)

//DELETE
router.delete('/deletecourse/:id',authorizationRole("admin"),deleteCourse)



module.exports = router