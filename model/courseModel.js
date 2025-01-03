const mongoose = require ('mongoose')

const courseSchema = new mongoose.Schema({
    courseName:{type:String,required:true},
    courseType:{type:String,required:true}, //online / offline
    courseTime:{type:String,required:true}, //morning / afternoon, evening
    courseAvailability:{type:String,required:true}, // Allday, Weekdays, Weekend
    courseDuration:{type:String,required:true}, //2hrs, 3hrs, 5hrs
    courseFee:{type:Number,required:true}
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