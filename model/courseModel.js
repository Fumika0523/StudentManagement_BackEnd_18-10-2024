const mongoose = require ('mongoose')

const courseSchema = new mongoose.Schema({
    courseName:{type:String,required:true},
    sessionType:{type:String,required:true}, //online / offline
    sessionTime:{type:String,required:true}, //morning / afternoon, evening
    sessionAvailability:{type:String,required:true}, // Allday, Weekdays, Weekend
    sessionDuration:{type:String,required:true}, //2hrs, 3hrs, 5hrs
},{
    timestamps:true
})

courseSchema.virtual('admissionRel',{
    ref:"Admission",
    localField:"_id",
    foreignField:"courseId"
})

const Course = mongoose.model("Course",courseSchema)
module.exports = Course