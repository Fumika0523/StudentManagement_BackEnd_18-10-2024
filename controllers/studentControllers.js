const mongoose = require("mongoose");
const Student = require('../model/studentModel')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const storage = multer.memoryStorage() //buffer


const addStudent = async (req, res) => {
    try {
        let student = await Student.findOne({
            $or: [
                { studentName: req.body.studentName },
                { username: req.body.username },
                { email: req.body.email },
                { phoneNumber: req.body.phoneNumber },
            ]
        })
        console.log(req.body)
        if (student) {
            // Determine which field is duplicate
            let duplicateField = '';
            if (student.studentName === req.body.studentName) duplicateField = 'Student name';
            else if (student.username === req.body.username) duplicateField = 'Username';
            else if (student.email === req.body.email) duplicateField = 'Email';
            else if (student.phoneNumber === req.body.phoneNumber) duplicateField = 'Phone number';

            return res.status(400).send({
                message: `${duplicateField} already exists. Please use a different one.`,
                field: duplicateField.toLowerCase().replace(' ', '')
            })
        }
        //password hashing
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)// using this round, combined with a password >> create a new pw
        const studentData = new Student({
            ...req.body,
            password: hashedPassword
        })
        await studentData.save()
        res.send({ student: studentData, message: "Successfully registred" })
    } catch (e) {
        // Handle MongoDB duplicate key error
        if (e.code === 11000) {
            const field = Object.keys(e.keyPattern)[0];
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
            
            return res.status(400).send({
                message: `${fieldName} already exists. Please use a different one.`,
                field: field
            })
        }
        
        console.error("Error adding student:", e);
        res.status(500).send({
            message: "Some internal error occurred",
            error: e.message
        })
    }
}

const signIn = async (req, res) => {
    try {
        let student = await Student.findOne({
            username: req.body.username
        })
        if (!student) {
            return res.status(400).send({
                message: "username Not Found"
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

const getAllStudent = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("userId", "isActive role email username")
      .lean();

    const studentData = (students || []).map((s) => {
      const isLinked = !!s.userId?._id;

      return {
        ...s,
        isLinked,
        isActive: s?.userId?.isActive ?? true,         // fallback true for legacy
        userRole: s?.userId?.role ?? "student",        // fallback
      };
    });

    return res.send({ studentData });
  } catch (e) {
    console.error("getAllStudent error:", e);
    return res.status(500).send({ message: "Some Internal Error" });
  }
};

const singleStudent = async (req, res) => {
    try {
        console.log(req.params.id)
        const getStudent = await Student.findById(req.params.id)
        if (!getStudent) {
            res.send({ message: "The student cant be found" })
        }
        else {
            res.send({ StudentData: getStudent })
        }
    } catch (e) {
        res.send({ message: "Some Internal Error" })
    }
}

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("updateStudent - id:", req.params)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student updated successfully", updatedStudent });
  } catch (e) {
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
        if (!deleteStudent) {
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

module.exports = { signIn, getAllStudent, singleStudent, updateStudent, deleteStudent, addStudent, }