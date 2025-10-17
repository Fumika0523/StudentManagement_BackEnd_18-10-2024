const Admission = require('../model/admissionModel')
const Student = require('../model/studentModel')
const express = require('express')
const router = express.Router()
const {auth,authorizationRole} = require ('../middleware/auth')
const {addAdmission, getAllAdmission, getSingleAdmission, updateAdmission, deleteAdmission} = require('../controllers/admissionControllers')
const Batch = require ('../model/batchModel')



router.post('/addadmission',auth,authorizationRole("admin" , "staff"),addAdmission)
//Table should be filled in View Student, prefered course in Student Model

//get (all)
router.get('/alladmission',auth,authorizationRole("admin" , "staff"),getAllAdmission)

//get (single)
router.get('/admission/:id',auth,authorizationRole("admin" , "staff"),getSingleAdmission)

//put (update) (edit >> front-end)
router.put('/updateadmission/:id',auth,authorizationRole("admin" , "staff"),updateAdmission)

//delete
router.delete('/deleteadmission/:id',auth,authorizationRole("admin" , "staff"),deleteAdmission)


// Check for admission fee Monthly Earning and annually, auto update should happen.

module.exports = router