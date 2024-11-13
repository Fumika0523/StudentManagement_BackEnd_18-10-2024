const jwt = require('jsonwebtoken')
const User = require('../model/userModel')

const auth = async(req,res,next)=>{
    console.log("Auth middleware is called")
    console.log(req.header('Authorization'))
    try{
        if(!req.header('Authorization')){
            return res.send
            ({
                message:"Authorization Header is Mission"
            })
        }
        const token =req.header('Authorization').replace("Bearer ","")
        const decode = jwt.verify(token,"nodejs")
        req.token = token
        const user = await User.findOne({_id:decode._id})
        req.user = user
        if(!user){
            req.send({
                user,message:"User Not Found"
            })
        }
        next()
    }catch(e){
        res.send({message:"Authentication Error"})
    }}

    module.exports = auth