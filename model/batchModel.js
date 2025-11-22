const mongoose = require('mongoose')

const batchSchema = new mongoose.Schema({
    batchNumber:{type:String,unique:true},
    sessionType:{type:String,required:true},
    courseName:{type:String,required:true},
    targetStudent:{type:String,required:true},
    sessionDay:{type:String,required:true}, 
    location:{type:String,required:true},
    sessionTime:{type:String,required:true},
    fees:{type:Number,required:true},
    seq:{type:Number},
    assignedStudentCount:{type:Number,default:0},
    status:{type:String,
    required:true,
    enum: ["Not Started", "In Progress", "Completed", "Training Completed"],
    default:"Not Started"
    },
    isApproved: {
  type: Boolean,
  default: false
},
approvalStatus: {
  type: String,
  enum: ["none", "pending", "approved", "declined"],
  default: "none"
},
requestedBy: {
  type: String,
  default: ""
},
startDate:{type:Date,required:true}
},{
    timestamps: true
})

const Batch = mongoose.model("Batch",batchSchema)

module.exports = Batch

