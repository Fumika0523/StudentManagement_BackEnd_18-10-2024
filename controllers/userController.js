const User = require('../model/userModel')
const Student = require('../model/studentModel')
const bcrypt = require('bcryptjs')
const sharp = require('sharp')

const signUp = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).send({ message: "Email is required" });

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).send({ message: "User already exists. Please log in." });
    }

    // password hashing (if not google)
    if (!req.body.password && !req.body.googleId) {
      return res.status(400).send({ message: "Password is required" });
    }

    let hashedPassword = undefined;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(req.body.password, salt);
    }

    const userData = new User({
      ...req.body,
      email,
      password: hashedPassword,
    });

    await userData.save();

    // If student role: create Student doc linked by userId (no duplicated identity)
    if (userData.role === "student") {
      await Student.create({
        userId: userData._id,
        // Student domain fields only (add what you need later)
        // e.g courseName, preferredCourses from req.body if you send them
        courseName: req.body.courseName,
        preferredCourses: req.body.preferredCourses || [],
      });
    }

    return res.status(200).json({
      success: true,
      user: userData,
      message: "Successfully registered a new user",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send({ message: "Some Internal Error Occurred" });
  }
};

const signIn = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "User does not exist" });
    }

    // if google user without password
    if (!user.password) {
      return res.status(400).send({ message: "This account uses Google login. Please sign in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Please check your password" });
    }

    const token = await user.generateAuthToken();

    return res.status(200).send({
      message: "You have successfully signed-in!",
      user,
      role: user.role,
      token,
    });
  } catch (e) {
    console.error("signIn error:", e);
    return res.status(500).send({ message: "Some Internal Error" });
  }
};

const getProfile =async(req,res)=>{
    try{
        //console.log(req.token)
       //console.log(req.user)
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

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, title, gender, phoneNumber, country, birthdate } = req.body;
// updates has no "name" key yet
    // update object with only allowed fields
    const updates = { firstName, lastName, title, gender, phoneNumber, country, birthdate, email };

    // Auto-sync the display name if either name are changed
    // const obj = {a:1}
    // obj.b=2  
    // console.log(obj) >> {a:1, b:2}
    if (firstName || lastName) {
      const user = await User.findById(req.user._id);
      //user.firstName >> fetching from the db >> current saved value.
      //firstName is from re.body - it could be undefined if the user didnt send it.
      updates.name = `${firstName || user.firstName} ${lastName || user.lastName}`.trim();
    }

    // Update and return the new doc (excluding password)
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, // who to update >> the logged in user. ID from the JWT
      //MongoDB operator 
      //$set >> only update these specific fields, leave everything else alone
      { $set: updates },// WHat to update - only the fields inside updates objects 
      { new: true, // return the updated document, not the old one
        runValidators: true //// enforce schema rules before saving
      } 
    ).select("-password"); // the password is stored in the db is a hashed version, not plain. but return to frontend with hashed code

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated", userData: updatedUser });

  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProfile = async(req,res)=>{
    try{
        //console.log(req.token)
        //console.log(req.user._id)
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

const getAllUser = async (req, res) => {
  try {
    const users = await User.find().lean();
    return res.status(200).send({ userData: users });
  } catch (e) {
    console.error("Get All User error:", e);
    return res.status(500).send({ message: "Some Internal Error" });
  }
};

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

module.exports ={getAllUser, signUp, signIn,getProfile, updateProfile,deleteProfile, dashboard, payment, uploadProfilePhoto}