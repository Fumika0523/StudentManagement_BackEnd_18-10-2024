const mongoose = require("mongoose");
const Student = require('../model/studentModel')
const multer = require('multer');
const User = require("../model/userModel");
const storage = multer.memoryStorage() //buffer
const bcrypt = require("bcrypt");

// POST: Sign up
const studentSignUp = async (req, res) => {
 // try {
      let student = await Student.findOne({
    $or: [
        { email: req.body.email },
        { phoneNumber: req.body.phoneNumber }
     ]
    });
      console.log("student",student)

    // password hashing
   if(student){
    console.log("Student is found",req.body.email)
    return res.send("Student Already Exist. Please Log-in")
}
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.password,salt)// using this round, combined with a password >> create a new pw
  const studentData = new Student({
      ...req.body,
      password:hashedPassword
  })
      await studentData.save();
      return res.status(200).json({
        success: true,
        user: studentData,
        message: "Successfully registered a new user",
      });
  // } catch (e) {
  //   console.error(e);
  //   return res.status(500).send({ message: "Some Internal Error Occurred" });
  // }
};

// POST: Sign in
const studentSignIn = async (req, res) => {
    try {
        let student = await Student.findOne({
            email: req.body.email
        })
        if (!student) {
            return res.status(400).send({
                message: "Email Not Found"
            })
        }
        //Checking by student with pw
        const isMatch = await bcrypt.compare(req.body.password, student.password)
        console.log(isMatch)
        if (!isMatch) {
            return res.status(400).send({
                message: "Please Check Your Password"
            })
        }
        if (isMatch && student) {
            const token = await student.generateAuthToken()
            return res.status(200).send({
                message: "You have successfully Loged in!",
                student: student,
                token: token
            })
        }
    } catch (e) {
        res.status(500).send({
            message: "Some internal error"
        })
    }
}

const getAllStudent = async(req,res)=>{
    try{
    const students = await Student.find()
    return res.send({studentData:students})
    }catch(e){
        console.error("Get All Student error:",e)
        return res.status(500).send({message:"Some Internal Error"})
    }
}

const singleStudent = async (req, res) => {
    try {
      const getSingleStudent = await Student.findById(req.params.id)
        if (!getSingleStudent) {
            res.send({ message: "The student cant be found" })
        }
        else {
            res.send({ singleStudentData: getSingleStudent })
        }
    } catch (e) {
        res.send({ message: "Some Internal Error" })
    }
}

// Define an async function that handles updating a student.
// req = incoming request, res = response we send back to the frontend.
const updateStudent = async (req, res) => {
  try {

    // Extract "id" from the URL params.
    // e.g. PUT /updatestudent/abc123  →  id = "abc123"
    // This is the Student document's _id (not the User _id).
    const { id } = req.params;

    // Validate that "id" is a proper MongoDB ObjectId format.
    // Prevents a database crash if someone sends a random string like "abc".
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid student id" }); // 400 = Bad Request
    }

    // Destructure req.body into two groups:
    // - Named fields (title, firstName, etc.) → belong to the User collection
    // - ...studentFields (everything else)    → belong to the Student collection
    const {
      title, firstName, lastName, email,
      phoneNumber, gender, birthdate, country,
      ...studentFields  // catches remaining fields e.g. { preferredCourses, status }
    } = req.body;

    // Group all the User fields into one object to pass to User.findByIdAndUpdate.
    // These are the fields that live in the User model (userModel.js).
    const userFields = {
      title, firstName, lastName, email,
      phoneNumber, gender, birthdate, country,
    };

    // Step 1: Find the Student document by its _id.
    // We need this first because the Student document holds "userId",
    // which tells us which User document to update.
    const student = await Student.findById(id);

    // If no student was found with that id, stop and return a 404 error.
    // 404 = Not Found
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Step 2: Update the User document.
    // student.userId is the reference (_id) to the linked User document.
    // We pass userFields (name, email, phone, etc.) to update only the User collection.
    // { new: true }          → return the updated document (not the old one)
    // { runValidators: true } → enforce the schema rules (e.g. required, enum) on update
    await User.findByIdAndUpdate(
      student.userId,   // the _id of the User linked to this Student
      userFields,       // the User fields to update
      { new: true, runValidators: true }
    );

    // Step 3: Update the Student document.
    // studentFields contains everything that wasn't a User field
    // e.g. { preferredCourses: ["English", "Math"], status: "Not Assigned" }
    // .populate("userId") → after updating, replace the userId reference
    // with the full User object so the response contains complete student info.
    const updatedStudent = await Student.findByIdAndUpdate(
      id,             // the Student _id from the URL
      studentFields,  // the Student fields to update
      { new: true, runValidators: true }
    ).populate("userId"); // join the User data into the response

    // Send a 200 success response with the updated student data back to the frontend.
    res.json({ message: "Student updated successfully", updatedStudent });

  } catch (e) {
    // If anything above throws an error (network, DB, validation, etc.),
    // log it to the server console for debugging
    // and return a 500 Internal Server Error to the frontend.
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteStudent = async (req, res) => {
    try {
        console.log("Delete Student by ID", req.params.id)
        const deletedStudent = await Student.findOneAndDelete({
            _id: req.params.id
        })
        if (!deletedStudent) {
            return res.status(404).send({ message: "Student Not Found" });
        }
        return res.status(200).send({ 
            message: "Student has been deleted successfully", 
            deletedStudent 
        });
        } catch (e) {
        res.send({ message: "Some Internal Error" })
    }
}

//multer >> upload option in nodejs app
//csvtojson >> convert csv data to json
// xlsv >> read ur excel

//npm i multer
// npm i csvtojson
//npm i xlsx
//memory storage

// CSV

// const getFile = async(req,res)=>{
//     res.send("Testing.. student module.. get File")
// }

// const uploadFile = async(req,res)=>{
//     try{
//         let data = []
//         const file = req.file // instead of req.body
//         //error handler
//         // file should end with .csv / excel
//         if(file.originalname.endWith(".csv")){
//         //csv to json //
//         data=await csv().fromFile(file.buffer.toString()) //single single json data -> {} {} {} >> data [{},{}]
//         }
//         if(file.originalname.endWith("xlsx")){

//         }else{
//             res.send("Please upload a csv file")
//         }
//     }catch(e){
//         res.send("Some Internal Error",e)
//     }
// }

// fs module >> file system >> work with file
// path module >> 

module.exports = { getAllStudent, singleStudent, updateStudent, deleteStudent, studentSignUp,studentSignIn }
