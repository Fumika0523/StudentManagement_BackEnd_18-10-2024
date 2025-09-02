const Admission = require('../model/admissionModel')
const Student = require('../model/studentModel')
const express = require('express')
const router = express.Router()
const {auth,authorizationRole} = require ('../middleware/auth')
const {addAdmission, getAllAdmission, getSingleAdmission, updateAdmission, deletAdmission} = require('../controllers/admissionControllers')


//work with studentID

router.post('/addadmission',authorizationRole("admin"),addAdmission)
//Table should be filled in View Student, prefered course in Student Model

//get (all)
router.get('/alladmission',authorizationRole("admin"),getAllAdmission)

//get (single)
router.get('/admission/:id',authorizationRole("admin"),getSingleAdmission)

    //Without Auth
    // const getAdmission = await Admission.findById(req.params.id)
    // res.send(getAdmission)

    //With Auth <<< TEST
    //try{
//     if(req.user){
//     const getAdmission = await req.user.populate("admissionRel")
//    if(getAdmission){
//        const allAdmissions=req.user.admissionRel
//    let AdmissionById=allAdmissions.filter((element,index)=>{
//        return element._id==req.params.id
//    })
//    if(AdmissionById.length!=0){
//        res.send(AdmissionById)
//    }else{
//        res.send({message:"Admission Not Found,Enter the correct ID"})
//    }}}
     // }catch(e){
    //        res.send({"message":"Some Internal Error"})
    // )



//put (update) (edit >> front-end)
router.put('/updateadmission/:id',authorizationRole("admin"),updateAdmission)

//delete
router.delete('/deleteadmission/:id',authorizationRole("admin"),deletAdmission)

//get monthly earning
router.get('/earnings',async(req,res)=>{
//giving you are current year (2024)
const currentYear = new Date().getFullYear()
console.log(currentYear)
const currentMonth = new Date().getMonth()+1

//fetch the detail
//find method, admissionYear, admissionMonth
//currentYear
const getAdmissionYear = await Admission.find({admissionYear:currentYear},{admissionFee:1,_id:0,admissionMonth:1})
//  {
//     "_id": "673b2ac03393aeb3ab007191",
//     "admissionFee": 25000
// }
// _id:0 >> gives you hiding _id
//res.send(getAdmissionYear)
// var month=[1,2,3,4,5,6,7,8,9,10,11,12] 
// function getMonthWords(monthno) {
// const monthAbbreviations = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// //month should be greater than or is equal to 1 , and always less than or is equal to 12.if not matching -> null
// //monthabbreviations is array, so [monthno - 1]
// return monthno >= 1 && monthno <= 12 ? monthAbbreviations[monthno - 1] : null;
// }
// //to work on each month
// month.forEach((monthElement)=>{
//     //console.log(monthElement) //showing only month 1-12
//     const getAdmissionMonth = getAdmissionYear.filter((element)=>{
//         // console.log(element) // showing with admission Fee & admissionMonth
//         //admisionMOnth is same with mothElement
//         element.admissionMonth==2
//         console.log(monthElement,element.admissionMonth)
//     })
//     console.log(getAdmissionMonth)

// })
const annualEarning = getAdmissionYear.reduce((acc,cv)=>acc+cv.admissionFee,0)
//console.log(annualEarning)

const getAdmissionMonth = await Admission.find({admissionMonth:currentMonth,admissionYear:currentYear},{admissionFee:1,_id:0})
console.log(getAdmissionMonth)
const monthlyEarning = getAdmissionMonth.reduce((acc,cv)=>acc+cv.admissionFee,0)
console.log(monthlyEarning)
// res.send({annualEarning,monthlyEarning})
res.send([{
    title:"EARNINGS (MONTHLY)",
    totalRevenue:monthlyEarning,
    icon:"TfiBag",
    color:"#4e73df"
},
{   
    title:"EARNINGS (ANNUAL)",
    totalRevenue:annualEarning,
    icon:"FaDollarSign",
    color:"#1cc88a"
},
{
    title:"TASKS",
    totalRevenue:"50%",
    icon:"FaClipboardList",
    color:"#36b9cc"
},
{
    title:"PENDING REQUESTS",
    totalRevenue:"18",
    icon:"IoIosChatbubbles",
    color:"#f6c23e"
}])
})


module.exports = router