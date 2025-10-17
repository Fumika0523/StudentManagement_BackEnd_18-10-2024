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

const authorizationRole = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      console.log("Check role");
      return res.status(401).send("User not authenticated");
    }

    // If role is an array, check if user's role is included
    if (Array.isArray(role)) {
      if (!role.includes(req.user.role)) {
        console.log("No Access");
        return res.status(403).send("Forbidden Access - Not allowed");
      }
    } else {
      // single role string
      if (req.user.role !== role) {
        console.log("No Access");
        return res.status(403).send("Forbidden Access - Not allowed");
      }
    }

    console.log("Access");
    next();
  };
};

    module.exports = {auth,authorizationRole}