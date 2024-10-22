const mongoose = require ('mongoose')
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    phoneNumber:{type:Number,required:true}
},{
    timestamps:true //registered time
})

userSchema.methods.generateAuthToken = async function(req,res){
    const user = this //?
    const token = jwt.sign({_id:user.id},
        process.env.JWT_SECRET_KEY)
        console.log(token)
        return token
}

const User = mongoose.model("User",userSchema)

module.exports=User