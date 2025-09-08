const User = require('../model/userModel')
const Student = require('../model/studentModel')
const bcrypt = require('bcryptjs')
const sharp = require('sharp')

const signUp = async (req, res) => {
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
}

const signIn = async(req,res)=>{
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
                        role: user.role,
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
}

const getProfile =async(req,res)=>{
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
}

const updateProfile = async(req,res)=>{
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
}

const deleteProfile = async(req,res)=>{
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
}

const dashboard = async(req,res)=>{
    try{
        res.send("Welcome to Dashboard,accessed by Admin")
    }catch(e){
        res.send({message:"Some internal error"})
    }
}

const payment = async(req,res)=>{
    try{
        res.send({
            message:"Welcome to Payment,accessed by Student",
            user:req.user.username,
            role:req.user.role
         } )
    }catch(e){
        res.send({message:"Some internal error"})
    }
}

const uploadProfilePhoto =  async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).send({ error: "No file uploaded" });
        }

        // Process image with sharp
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 100, height: 100 })
            .png()
            .toBuffer();

        // Save processed image to user
        req.user.avatar = buffer;
        await req.user.save();

        res.status(200).send({ message: "File Uploaded Successfully" });

    } catch (error) {
        console.error("Error uploading avatar:", error);

        // Handle multer-specific errors or general errors
        if (error instanceof multer.MulterError) {
            return res.status(400).send({ error: error.message });
        }

        res.status(500).send({ error: "Failed to upload image" });
    }
}

module.exports ={signUp, signIn,getProfile, updateProfile,deleteProfile, dashboard, payment, uploadProfilePhoto}