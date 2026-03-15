const mongoose = require ('mongoose')

const admissionSchema = new mongoose.Schema({
    courseName:{type:String,required:true},
    studentName:{type:String,required:true},
    admissionSource:{type:String,required:true},
    admissionFee:{type:Number,required:true},//courseFee
    admissionDate:{type:Date,required:true},
    admissionYear:{type:Number},
    admissionMonth:{type:String},
    studentId:{
        type:mongoose.Schema.Types.ObjectID,
        ref:"Student",
        required:true 
    },
    courseId:{
        type:mongoose.Schema.Types.ObjectID,
        ref:"Course",
        required:true
    },
      admissionId: { type: mongoose.Schema.Types.ObjectId },
      batchNumber:{type:String,},
      status:{type:String}
},{
    timestamps:true
})

const Admission = mongoose.model("Admission",admissionSchema)

module.exports = Admission