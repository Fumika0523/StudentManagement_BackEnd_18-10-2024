const xlsx=require('xlsx')
const fs=require("fs")
const path=require("path")
const User = require('../model/userModel')
const Student=require('../model/studentModel')
const Admission = require('../model/admissionModel')

const downloadTemplate = (req,res)=>{
console.log("downloadTemplate")
const templateData = [
    {email:"",name:"", password:"", phoneNumber:"", gender:"" }
]
const wb = xlsx.utils.book_new() // new excel sheet 
const ws = xlsx.utils.json_to_sheet(templateData)//json data to sheet >> templatedata

xlsx.utils.book_append_sheet(wb,ws,"Users") //append

//store that location
console.log(path.join(__dirname,"../uploads/users_template.xlsx"))
const filePath = path.join(__dirname, "../uploads/users_template.xlsx")
xlsx.writeFile(wb,filePath)

res.download(filePath, "users_template.xlsx")
}

const importExcel = async(req,res)=>{
console.log("ImportExcel")
try{
const workbook = xlsx.readFile(req.file.path)
const sheetName = workbook.SheetNames[0]//Users
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])

let inserted = 0
let updated = 0

// for of >>objects
// insertMany
//insert / update

for (const row of data){
    const result = await User.updateOne(
        {email:row.email} ,//Match
        {$set:row}, //UPdate data
        {upsert:true} // insert if not exists
    )
    if(result.upsertedCount)
        inserted++;
    else updated++
}
res.json({
    message:"Excel processed",
    inserted,
    updated
})
}catch(e){
console.log(e)
}
}

//Student
const downloadStudentTemplate=(req,res)=>{
    console.log("downloadStudentTemplate is calling..")
    const templateData = [
       {studentName:"",username:"", email:"", password:"",phoneNumber:"",gender:"",birthdate:"", preferredCourses:[], } 
    ]
    const wb = xlsx.utils.book_new() // new excel sheet
    const ws = xlsx.utils.json_to_sheet(templateData) //json data to sheet >> template Data
    xlsx.utils.book_append_sheet(wb,ws,"Students")

    //store that location
    console.log(path.join(__dirname,"../uploads/students_template.xlsx"))
    const filePath = path.join(__dirname, "../uploads/students_template.xlsx")
    xlsx.writeFile(wb,filePath)
    res.download(filePath, "students_template.xlsx")
}

const importStudentExcel = async(req,res)=>{
    console.log("import  from studentBulkloadController is calling")
    try{
        console.log("importStudentExcel:",req.file)
        const workbook = xlsx.readFile(req.file.path)
        const sheetName = workbook.SheetNames[0] //Students
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        raw: false,      // gives formatted text for some cells
        cellDates: true, // parse date cells as Date where possible
        });        
            console.log("First row keys:", Object.keys(data?.[0] || {}));
console.log("First row:", data?.[0]);


        let inserted = 0
        let updated = 0

        for (const row of data )
        {
            const result = await Student.updateOne(
                {email:row.email}, // Match
                {$set:row}, // update data
                {upsert:true} // insert if not exists
            )
            if(result.upsertedCount)
                inserted ++;
            else updated++;
        }
        res.json({
            message:"Excel processed",
            inserted,
            updated
        })
        }catch(e){
        console.error("Some internal error",e)
    }
}

//Admission
const downloadAdmissionTemplate=(req,res)=>{
    console.log("downloadAdmissionTemplate is calling..")
    const templateData = [
       {studentId:"", studentName:"", courseId:"", courseName:"", admissionSource:"", admissionFee:"",admissionDate:"",  courseName:"",batchNumber:"",  status:"" } 
    ]
    const wb = xlsx.utils.book_new() // new excel sheet
    const ws = xlsx.utils.json_to_sheet(templateData) //json data to sheet >> template Data

    xlsx.utils.book_append_sheet(wb,ws,"Admissions")

    //store that location
    console.log(path.join(__dirname,"../uploads/admissions_template.xlsx"))
    const filePath = path.join(__dirname, "../uploads/admissions_template.xlsx")
    xlsx.writeFile(wb,filePath)
    res.download(filePath, "admissions_template.xlsx")
}

const importAdmissionExcel = async(req,res)=>{
    console.log("import  from admissionBulkloadController is calling")
    try{
        const workbook = xlsx.readFile(req.file.path)
        const sheetName = workbook.SheetNames[0] //Admissions
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])

        let inserted = 0
        let updated = 0

        for (const row of data )
        {
            const result = await Admission.updateOne(
                {studentName:row.studentName}, // Match
                {$set:row}, // update data
                {upsert:true} // insert if not exists
            )
            if(result.upsertedCount)
                inserted ++;
            else updated++;
        }
        res.json({
            message:"Excel processed",
            inserted,
            updated
        })
        }catch(e){
        console.error("Some internal error",e)
    }
}
module.exports={downloadTemplate,importExcel,downloadStudentTemplate, importStudentExcel,downloadAdmissionTemplate, importAdmissionExcel}