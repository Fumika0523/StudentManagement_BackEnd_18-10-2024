const User = require('../model/userModel')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const sharp = require('sharp')
const {auth, authorizationRole} = require ('../middleware/auth')


router.get("/test",authorizationRole,(req,res)=>{
    console.log("test")
})

// User can see everything, student can access only specific area
//POST REQUEST
router.post('/signup',async(req,res)=>{
    // try{
        //check if the user is already registered
        let user = await User.findOne({
            $or:[
                {email:req.body.email},
                {phoneNumber:req.body.phoneNumber}
            ]  
    })
    console.log("User Not Found") 
    if(user){console.log("User is found",req.body.email)
        return res.send("User Already Exist. Please Log-in")
    }
    //password hashing
    const salt = await bcrypt.genSalt(10) //rounds 10 times
    const hashedPassword = await bcrypt.hash(req.body.password,salt) //using this round, combined with a password >> create a new pw
    const userData = new User({
        ...req.body, //making the copy of req.body
        password:hashedPassword // this one I need to update
    })
    await userData.save() // Saving to DB
    res.send({user:userData,message:"Successfully signed in"}) //either object or text, cannot send both. 
// }catch(e){
//     res.send("Some Internal Error Occurred")
// }
})

//Sign In
router.post('/signin',async(req,res)=>{
    try{
        let user = await User.findOne({
        //checking by user detail with email
        //username coming from postman which you entering
        username:req.body.username
        })
       //console.log(user)
        //console.log(req.body.password)
        if(!user){
            return res.status(400).send
            ({
                message:"Username Not Found"
            })}

            //checking by user with password
            const isMatch = await bcrypt.compare(req.body.password,user.password)// from postman , from the email is matched?
            if(!isMatch){
                return res.status(400).send({
                    message:"Please Check Your Password"
                })}
                //if user and isMatch both validations are successful then generate the token
                if(isMatch && user){
                    const token = await user.generateAuthToken()
                    return res.status(200).send({
                        message:"You have successfully Signed-in!!!",
                        user:user,
                        token:token,
                    })
                }
            // If all conditions failed it will come to this
            res.status(401).send({
                message:"Your login credentials are incorrect,kindly check and re-enter!"
            })
    }catch(e){
            res.status(500).send({message:"Some Internal Error"})
    }})

    //UPDATE the profile photo
//  router.post('/users/profile/upload/image',auth,upload.single('avatar'),async(req,res)=>{
//         try{
//             const buffer = await sharp (req.file.buffer).resize({width:100,height:100}).png().toBuffer()
//             //req.user.avatar=req.file.buffer // directly updating
//             req.user.avatar = buffer
//             await req.user.save()
//             if(buffer){
//             res.send({message:"File Uploaded Successfully"})
//         }
//             //req.file.buffer >> hold the binary data
//         }catch(e){
//             console.log(e)
//         }
//     },(error,req,res,next)=>{
//         res.send({showError:error.message})
//         })
//     })

 
// GET
router.get('/users/profile',auth,async(req,res)=>{
    //res.send("ProfileRoute")
    try{
        console.log(req.token)
       console.log(req.user)
        const getProfile = await User.findById(req.user._id)
        if(!getProfile){
            res.send({
                message:"The User Profile CANNOT BE FOUND!"
            })
        }
        res.send({userData:getProfile}) //
    }catch(e){
        res.send({message:"Some Internal Error"})
    }
})

//UPDATE
router.put('/users/profile',auth,async(req,res)=>{
    try{
      console.log("Update Profile ID", req.user._id)
      if(req.body.password){
        const salt = await bcrypt.genSalt(10)
        const hashedPassword= await bcrypt.hash(req.body.password,salt)
        req.body.password=hashedPassword
         }
         const updateUser = await User.findByIdAndUpdate(req.user._id,req.body,{new:true,runValidators:true})
         if(!updateUser){res.send({message:"User Not Found"})
        }res.send(updateUser)
     }catch(e){
        res.send({message:"Some Internal Error"})
    }
})

//DELETE
router.delete('/users/profile',auth,async(req,res)=>{
    try{
        console.log(req.token)
        console.log(req.user._id)
        console.log("DELETE PROFILE ID",req.user._id)
        const deleteProfile = await User.findByIdAndDelete(req.user._id)
        if(!deleteProfile){
            res.send({message:"USER NOT FOUND"})
        }res.send({
            deleteProfile,message:"Profile Deleted successfully"
        })
    }catch(e){
        res.send({message:"Some Internal Error"})
    }
})
module.exports = router