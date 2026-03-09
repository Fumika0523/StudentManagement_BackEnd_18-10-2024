const express=require("express")
const multer=require('multer')
const {importExcel,downloadTemplate,downloadStudentTemplate,importAdmissionExcel, downloadAdmissionTemplate, addUpdateStudentExcel, bulkDisableStudentsExcel, downloadTaskTemplate, importTaskExcel} = require('../controllers/excel.controller')
const router=express.Router()
const upload = multer({ dest: 'uploads/' })

//Sample
router.get('/template',downloadTemplate)
router.post('/import',upload.single('file'), importExcel) // only single file

//student
router.get('/student-template',downloadStudentTemplate)
router.post('/student-add-update',upload.single('file'),addUpdateStudentExcel)
router.post('/student-delete',upload.single('file'),bulkDisableStudentsExcel)

//admission
router.get('/admission-template',downloadAdmissionTemplate)
router.post('/admission-import',upload.single('file'),importAdmissionExcel)

//Task
router.get('/task-template',downloadTaskTemplate)
router.post('/task-import',upload.single('file'),importTaskExcel )

module.exports = router