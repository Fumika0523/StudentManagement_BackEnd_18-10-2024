const mongoose =require('mongoose')
const jwt = require ("jsonwebtoken")

const studentSchema = new mongoose.Schema({
    studentName:{type:String,required:true},
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    phoneNumber:{type:Number,required:true},
    gender:{type:String,default:"Rather not say"},
    birthdate:{type:Date,required:true},
},{
    timeStamps:true // registered time
})

studentSchema.methods.generateAuthToken = async function(req,res){
    const user = this
    const token = jwt.sign({_id:user.id},process.env.JWT_SECRET_KEY)
    console.log(token)
    return token
}

studentSchema.virtual('admissionRel',{
    ref:"Admission",
    localField:"_id",
    foreignField:"studentId"
})

const Student = mongoose.model("Student",studentSchema)

module.exports = Student