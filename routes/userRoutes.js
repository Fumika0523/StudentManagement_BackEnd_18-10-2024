const User = require('../model/userModel')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const sharp = require('sharp')
const {auth, authorizationRole} = require ('../middleware/auth')
const Student = require('../model/studentModel')


router.get("/test",authorizationRole,(req,res)=>{
    console.log("test")
})

// User can see everything, student can access only specific area
//POST REQUEST
router.post('/signup', async (req, res) => {
  try {
    // check if the user is already registered
    let user = await User.findOne({
      $or: [
        { email: req.body.email },
        { phoneNumber: req.body.phoneNumber }
      ]
    });

if (user) { console.log("User is found", req.body.email);
     return res.status(400).send("User Already Exist. Please Log-in"); 
    n}
    // password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // save user
    const userData = new User({
      ...req.body,
      password: hashedPassword
    });
    await userData.save();

    // if student role, also save in Student collection
    if (req.body.role === "student") {
      const studentData = new Student({
        _id: userData._id,              // studentId = userId
        username: req.body.username,    
        studentName: req.body.username, 
        birthdate: req.body.birthdate,  
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        gender: req.body.gender,
        password: hashedPassword,
        role: req.body.role
      });
      await studentData.save();
    }
    res.status(200).json({ 
      success: true,
      user: userData, 
      message: "Successfully registered a new user" 
    });

  } catch (e) {
    console.error(e);
    res.status(500).send("Some Internal Error Occurred");
  }
});


// student & user Id should be same

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
    }
})

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

//Sample

router.get('/dashboard',auth,authorizationRole("admin"),async(req,res)=>{
    try{
        res.send("Welcome to Dashboard,accessed by Admin")
    }catch(e){
        res.send({message:"Some internal error"})
    }
})


router.get('/payment',auth,authorizationRole("student"),async(req,res)=>{
    try{
        res.send({
            message:"Welcome to Payment,accessed by Student",
            user:req.user.username,
            role:req.user.role
         } )
    }catch(e){
        res.send({message:"Some internal error"})
    }
})


module.exports = router