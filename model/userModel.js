const mongoose = require ('mongoose')
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    phoneNumber:{type:Number,required:true},
    gender:{type:String,default:"Rather not say"},
    birthdate:{type:Date,required:true},
    role:{
        type:String,
        enum:["admin","user","manager","supportTeam","testingTeam","guest","student"],
        required:true,
        // default:"user"  
    }
},{
    timestamps:true //registered time
})

userSchema.methods.generateAuthToken = async function(req,res){
    const user = this
    const token = jwt.sign({_id:user.id,role:user.role},process.env.JWT_SECRET_KEY)
    console.log(token)
    return token
}

// userSchema.virtual('admissionRel',{
//     ref:"Admission",
//     localField:"_id",
//     foreignField:"owner"
// })

userSchema.virtual('studentRel',{
    ref:"Student",
    localField:"_id",
    foreignField:"owner"
})

const User = mongoose.model("User",userSchema)

module.exports=User

// For Staff 