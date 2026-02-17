const express=require("express")
const multer=require('multer')
const {importExcel,downloadTemplate,downloadStudentTemplate,importAdmissionExcel, downloadAdmissionTemplate, addUpdateStudentExcel, bulkDeleteStudentsExcel} = require('../controllers/excel.controller')
const router=express.Router()
const upload = multer({ dest: 'uploads/' })


router.get('/template',downloadTemplate)
router.post('/import',upload.single('file'), importExcel) // only single file
//student
router.get('/student-template',downloadStudentTemplate)
router.post('/student-add-update',upload.single('file'),addUpdateStudentExcel)
router.post('/student-delete',upload.single('file'),bulkDeleteStudentsExcel)

//admission
router.get('/admission-template',downloadAdmissionTemplate)
router.post('/admission-import',upload.single('file'),importAdmissionExcel)



module.exports = router