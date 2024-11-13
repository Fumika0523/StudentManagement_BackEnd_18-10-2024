const mongoose = require ('mongoose')

const admissionSchema = new mongoose.Schema({
    admissionSource:{type:String,required:true},
    admissionClass:{type:String,required:true},
    admissionFee:{type:Number,required:true},
    studentId:{
        type:mongoose.Schema.Types.ObjectID,
        ref:"Student",
        required:true // 
    }
},{
    timestamps:true
})

const Admission = mongoose.model("Admission",admissionSchema)

module.exports = Admission