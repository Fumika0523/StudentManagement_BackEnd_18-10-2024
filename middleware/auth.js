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
        const decode = jwt.verify(token,process.env.JWT_SECRET_KEY || "nodejs")
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

const authorizationRole=(role)=>{
    //req >>  a data send from front-end
    return(req,res,next)=>{
      //  console.log(req.user.role)
        if(!req.user || !req.user.role){
            console.log("Check role")
             return;
        }
            // res.send({"role":"admin"})
            if(!req.user || req.user.role !==role){
                console.log("No Access")
                return res.send("Forbidden Access - Not allowed")
            }else{
                console.log("Access")
            }
    next()
    }
}
    module.exports = {auth,authorizationRole}