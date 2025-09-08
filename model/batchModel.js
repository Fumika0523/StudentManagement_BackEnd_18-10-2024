const mongoose = require('mongoose')

const batchSchema = new mongoose.Schema({
    batchNumber:{type:String,required:true,unique:true},
    sessionType:{type:String,required:true},
    courseName:{type:String,required:true},
    targetStudent:{type:String,required:true},
    sessionDay:{type:String,required:true}, // weekday/weekend
    location:{type:String,required:true},//online/offline
    sessionTime:{type:String,required:true},
    fees:{type:Number,required:true},
    seq:{type:Number},
    assignedStudent:{type:Number},
    status:{type:String,required:true,default:"active"}
},{
    timestamps:true
})

const Batch = mongoose.model("Batch",batchSchema)

module.exports = Batch

