const Course = require('../model/courseModel')
const express = require('express')
const router = express.Router()
const {auth,authorizationRole} = require('../middleware/auth')
const {addCourse, allCourse, updateCourse, deleteCourse} = require('../controllers/courseControllers')

//add
router.post('/addcourse',auth,authorizationRole(["admin", "staff"]),addCourse)

//get (All)
router.get('/allcourse',auth,authorizationRole(["admin", "staff"]),allCourse)

//UPDATE
router.put('/updatecourse/:id',auth,authorizationRole(["admin", "staff"]),updateCourse)

//DELETE
router.delete('/deletecourse/:id',auth,authorizationRole(["admin", "staff"]),deleteCourse)


module.exports = router