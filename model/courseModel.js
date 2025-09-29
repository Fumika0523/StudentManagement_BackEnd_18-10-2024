const mongoose = require ('mongoose')

const courseSchema = new mongoose.Schema({
    courseName:{type:String,required:true},
    courseType:{type:String,required:true}, //online / offline
    dailySessionHrs:{type:String,required:true}, 
    courseAvailability:{type:String,required:true}, // Allday, Weekdays, Weekend
    courseDuration:{type:String,required:true}, //2hrs, 3hrs, 5hrs
    noOfDays:{type:String,required:true},
    courseFee:{type:Number,required:true}
},{
    timestamps: true
})

courseSchema.virtual('admissionRel',{
    ref:"Admission",
    localField:"_id",
    foreignField:"courseId"
})

const Course = mongoose.model("Course",courseSchema)
module.exports = Course