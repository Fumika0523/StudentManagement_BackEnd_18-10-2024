const express=require("express")
const multer=require('multer')
const {importExcel,downloadTemplate,downloadStudentTemplate,importStudentExcel, downloadAdmissionTemplate, importAdmissionExcel} = require('../controllers/excel.controller')
const router=express.Router()
const upload = multer({ dest: 'uploads/' })


router.get('/template',downloadTemplate)
router.post('/import',upload.single('file'), importExcel) // only single file
//student
router.get('/student-template',downloadStudentTemplate)
router.post('/student-import',upload.single('file'),importStudentExcel)

//admission
router.get('/admission-template',downloadAdmissionTemplate)
router.post('/admission-import',upload.single('file'),importAdmissionExcel)



module.exports = router