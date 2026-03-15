const mongoose = require ('mongoose')
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    country:{type:String,required:false},
    email:{type:String,required:true, unique:true },
    password:{type:String,required:false},
    phoneNumber:{type:String,required:false},
    gender:{type:String,default:"Rather not say"},
    birthdate:{type:Date,required:false},
    role:{
        type:String,
        enum:["admin","user","manager","supportTeam","testingTeam","guest","staff"],
        //enum:["staff"],
        required:false,
        // default:"admin"  
    }
},{
    timestamps:true //registered time
})


userSchema.methods.generateAuthToken = async function(req,res){
    const user = this
    const token = jwt.sign({
        _id:user.id,
        role:user.role},
        process.env.JWT_SECRET_KEY)
    console.log(token)
    return token
}

// userSchema.virtual('admissionRel',{
//     ref:"Admission",
//     localField:"_id",
//     foreignField:"owner"
// })

const User = mongoose.model("User",userSchema)

module.exports=User
