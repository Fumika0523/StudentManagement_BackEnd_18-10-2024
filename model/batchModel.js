const mongoose = require('mongoose')

const batchSchema = new mongoose.Schema({
    batchNumber:{type:String,unique:true},
    sessionType:{type:String,required:true},
    courseName:{type:String,required:true},
    targetStudent:{type:String,required:true},
    sessionDay:{type:String,required:true}, 
    location: {
      display: { type: String, required: true }, // e.g. "Tokyo, Japan"
      city: { type: String, required: true },    // e.g. "Tokyo"
      country: { type: String, required: true }, // e.g. "Japan"
      countryCode: { type: String, required: true, uppercase: true }, // e.g. "JP"
      timezone: { type: String, default: "" },   // e.g. "Asia/Tokyo"
    },
    sessionTime:{type:String,required:true},
    fees:{type:Number,required:true},
    seq:{type:Number},
    assignedStudentCount:{type:Number,default:0},
    status:{type:String,
    required:true,
enum: ["Not Started", "In Progress", "Training Completed", "Batch Completed"],
    default:"Not Started"
    },
requestedBy: {
  type: String,
  default: ""
},
approvalStatus: {
  type: String,
  enum: ["pending", "approved", "declined", null],
  default: null
},
approvedBy: {
  type: String,
  default: null
},
approvedAt: {
  type: Date,
  default: null
},
startDate:{type:Date,required:true}
},{
    timestamps: true
})

const Batch = mongoose.model("Batch",batchSchema)

module.exports = Batch

