const mongoose = require ('mongoose')


const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    phoneNumber:{type:Number,required:true}
},{
    timestamps:true //registered time
})



const User = mongoose.model("User",userSchema)

module.exports=User