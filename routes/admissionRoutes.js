const Admission = require('../model/admissionModel')
const express = require('express')
const router = express.Router()
// const auth = require('../middleware/auth')

//work with studentID
//post
router.post('/addadmission',async(req,res)=>{
    //try{
    //object destructuring
        const {admissionDate} = req.body
        const dateObj = new Date(admissionDate)
        const year = dateObj.getFullYear(); //admissiondate year
        const month = dateObj.getMonth() + 1; //get month always start 0, thats why plus 1
        const admissionDetail = new Admission ({
            ...req.body, // makingg the copy of req. body
       //     studentId:req.user._id // who contacted
            admissionYear:year,
            admissionMonth:month
        })
        if(!admissionDetail){
            res.status(401).send({message:"Unabel to contact to admission"})
        }
        await admissionDetail.save()
        res.status(200).send({
            admissionDetail:admissionDetail,message:"Your Admission detail has successfully been sent!"
        })
    // }catch(e){
    //     res.status(500).send({message:"Some Internal Error"})
    // }
})

//get (all)
router.get('/alladmission',async(req,res)=>{
    // without Auth
    // const getAllAsmission = await Admission.find()
    // res.send(getAllAsmission)

    // With Auth << TEST
    try{
        console.log(req.token)
        const getAdmissionData = await Admission.find()
        if(!getAdmissionData){
            res.send({message:"The Admission Data canot be found"})
        }res.send({admissionData:getAdmissionData})
    }catch(e){
        res.send({message:"Some Internal Error"})
    }
    })

//get (single)
router.get('/admission/:id',async(req,res)=>{
    //Without Auth
    // const getAdmission = await Admission.findById(req.params.id)
    // res.send(getAdmission)

    //With Auth <<< TEST
    try{
    if(req.user){
    const getAdmission = await req.user.populate("admissionRel")
   if(getAdmission){
       const allAdmissions=req.user.admissionRel
   let AdmissionById=allAdmissions.filter((element,index)=>{
       return element._id==req.params.id
   })
   if(AdmissionById.length!=0){
       res.send(AdmissionById)
   }else{
       res.send({message:"Admission Not Found,Enter the correct ID"})
   }}}
       }catch(e){
           res.send({"message":"Some Internal Error"})
       }
})

//put (update) (edit >> front-end)
router.put('/updateadmission/:id',async(req,res)=>{
    //Without Auth
    const updateAdmission = await Admission.findOneAndUpdate(req.params.id)

    // const updateAdmission = await Admission.findOneAndUpdate({_id:req.params.id,owner:req.user._id},req.body,{new:true, runValidators:true})
    // try{
    //     console.log(updateAdmission)
    //     if(!updateAdmission){
    //     return res.send({message:"Can't update the Admission, please check again"})
    //      }
    //      res.send({message:"The Admission has been successfully updated",updateAdmission})
    // }catch(e){
    //     res.send({message:"Some Internal Error Occur"})
    // }
})

//delete
router.delete('/deleteadmin/:id',async(req,res)=>{
    // try{
        console.log("Delete Admission by ID",req.params.id)
        const deleteAdmission = await Admission.findOneAndDelete({
            _id:req.params.id,studentId:req.user._id
        })
        if(!deleteAdmission){
            res.send({message:"Admission Not Found"})
        }
        res.send({message:"Admission has been deleted successfully",deleteAdmission})
        // }catch(e){
        //     res.send({message:"Some Internal Error"})
        // }
})

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
},])
})


module.exports = router