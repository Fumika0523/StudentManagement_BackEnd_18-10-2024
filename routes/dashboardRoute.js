const Admission = require('../model/admissionModel')
const Student = require('../model/studentModel')
const Batch = require ('../model/batchModel')
const express = require('express')
const router = express.Router()
const {auth,authorizationRole} = require ('../middleware/auth')

//get monthly earning
router.get('/earnings',auth,authorizationRole("admin"),async(req,res)=>{
const currentYear = new Date().getFullYear()
console.log("currentYear",currentYear)
const currentMonth = new Date().getMonth()+1
console.log("currentMonth",currentMonth)


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


// Admission Month
const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

const getAdmissionMonth = await Admission.find({
  createdAt: { $gte: startOfMonth, $lt: startOfNextMonth }
}, { admissionFee: 1, _id: 0 });

const monthlyEarning = getAdmissionMonth.reduce((acc, cv) => acc + cv.admissionFee, 0);
console.log("monthlyEarning", monthlyEarning);

// Normally Calculation should be in Front-End
// Get batches for the current month
//current Date, Current Month, Update Model or calculate here.
//Filter from Start Date, Use find method(mongoose), Not filter(Array method).
const getBatchMonth = await Batch.aggregate([
    // $addFields → temporarily creates two new fields for each document:
// startYear = year part of startDate
// startMonth = month part of startDate
// $match → filters documents so that:
// startYear equals the current year
// startMonth equals the current month (1–12)
  {
    $addFields: {
      startYear: { $year: "$startDate" },
      startMonth: { $month: "$startDate" }
    }
  },
  {
    $match: {
      startYear: currentYear,
      startMonth: currentMonth
    }
  }
]);
console.log("getBatchMonth", getBatchMonth);
const monthlyBatchCount = getBatchMonth.length;
console.log("monthlyBatchCount", monthlyBatchCount);
const getStudentMonth = await Student.find({
  createdAt: {
    $gte: new Date(now.getFullYear(), now.getMonth(), 1),
    $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
  }
});
console.log("Students created this month:", getStudentMonth.length);
const monthlyStudentCount = getStudentMonth.length

// First day of current year (Jan 1st, 00:00)
const startOfYear = new Date(currentYear, 0, 1);
// First day of next year (Jan 1st, 00:00 of next year)
const startOfNextYear = new Date(currentYear + 1, 0, 1);

const getStudentYear = await Student.find({
  createdAt: { $gte: startOfYear, $lt: startOfNextYear }
});

const studentCountYear = getStudentYear.length;
console.log("Total students created this year:", studentCountYear);
const getBatchYear = await Batch.find({
      createdAt: { $gte: startOfYear, $lt: startOfNextYear }
}) 
const batchCountYear = getBatchYear.length;
console.log("Total batch counted this year:", batchCountYear);

// get all admissions for current year
const getAdmissionYear = await Admission.find(
  { admissionYear: currentYear },
  { admissionFee: 1, _id: 0 }
);

console.log("getAdmissionYear", getAdmissionYear);

// sum up the fees
const annualEarning = getAdmissionYear.reduce((acc, cv) => acc + cv.admissionFee, 0);

console.log("annualEarning", annualEarning);


res.send(
    [
    {
    title:"EARNINGS ",
    total:monthlyEarning,
    icon:"TfiBag",
    color:"#4e73df"
},
{   
    title:"EARNINGS",
    total:monthlyEarning,
    icon:"FaDollarSign",
    color:"#1cc88a"
},
{
    title:"TOTAL BATCHES",
    total: monthlyBatchCount,
    icon:"FaClipboardList",
    color:"#36b9cc"
},
{
    title:"TOTAL ENROLLMENTS", 
    total:monthlyStudentCount,
    icon:"IoIosChatbubbles",
    color:"#f6c23e"
},
    {
    title:"EARNINGS",
    total:annualEarning,
    icon:"TfiBag",
    color:"#4e73df"
},
{   
    title:"EARNINGS",
    total:annualEarning,
    icon:"FaDollarSign",
    color:"#1cc88a"
},
{
    title:"TOTAL BATCHES",
    total:batchCountYear,
    icon:"FaClipboardList",
    color:"#36b9cc"
},
{
    title:"TOTAL ENROLLMENTS",
    total:studentCountYear,
    icon:"IoIosChatbubbles",
    color:"#f6c23e"
}],
)
})

module.exports = router 