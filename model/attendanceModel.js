const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
    attendance:{type:Number,require:true},
    sessionId:{type:String,require:true},
    attendanceDate:{type:Number,require:true},
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Attendance",
        required:true
    }
},{
    timestamps:true
})

const Admission = mongoose.model("Attendance",admissionSchema)
module.exports = Admission