const mongoose =require('mongoose')
const jwt = require ("jsonwebtoken")

// we will update later
const studentSchema = new mongoose.Schema({
    googleId:{type:String},
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    studentName:{type:String,required:false},
    email:{type:String,required:true, unique: true },
    password:{type:String,required:true},
    phoneNumber: { type: String, required: false, trim: true },
    gender:{type:String,default:"Rather not say"},
    birthdate:{type:Date,required:false},
    courseName:{type:String,required:false},
    admissionFee:{type:Number,required:false},
    batchNumber: {type: String,default: null}, // ref:Batch??
    preferredCourses:{type:[String],required:false,},
    country: { type: String, required: false, trim: true },
    status: { type: String, default: "Not Assigned" },
    absenceDays:{},
    presentDays:{},
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:false
    },
    admissionDate:{type:Date,required:false},
    admissionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admission",
        required:false
    }, 
       role: { type: String, default: "student" },
},{
    timestamps: true
})

studentSchema.pre("save", function (next) {
  this.studentName = `${this.firstName || ""} ${this.lastName || ""}`.trim();
  next();
});

studentSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign({
     _id: this._id,
     role:this.role
     },
      process.env.JWT_SECRET_KEY)
  return token
}

studentSchema.virtual('admissionRel',{
    ref:"Admission",
    localField:"_id",
    foreignField:"studentId"
})

const Student = mongoose.model("Student",studentSchema)

module.exports = Student