const mongoose = require ('mongoose')

const admissionSchema = new mongoose.Schema({
    courseName:{type:String,required:true},
    admissionSource:{type:String,required:true},
    // admissionClass:{type:String,required:true},
    admissionFee:{type:Number,required:true},
    admissionDate:{type:Number,required:true},
    admissionYear:{type:Number},
    admissionMonth:{type:String},
    studentId:{
        type:mongoose.Schema.Types.ObjectID,
        ref:"Student",
        required:true // 
    },
    courseId:{
        type:mongoose.Schema.Types.ObjectID,
        red:"Course",
        required:true
    }
},{
    timestamps:true
})

const Admission = mongoose.model("Admission",admissionSchema)

module.exports = Admission