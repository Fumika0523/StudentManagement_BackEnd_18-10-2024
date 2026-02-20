const xlsx=require('xlsx')
const bcrypt = require("bcrypt");
const fs=require("fs")
const path=require("path")
const User = require('../model/userModel')
const Admission = require('../model/admissionModel')
const Student = require('../model/studentModel')

//Sample
const downloadTemplate = (req,res)=>{
console.log("downloadTemplate")
const templateData = [
    {email:"",name:"", password:"", phoneNumber:"", gender:"" }
]
const wb = xlsx.utils.book_new() // new excel sheet 
const ws = xlsx.utils.json_to_sheet(templateData)//json data to sheet >> templatedata

xlsx.utils.book_append_sheet(wb,ws,"Users") //append

//store that location
console.log(path.join(__dirname,"../uploads/users_template.xlsx"))
const filePath = path.join(__dirname, "../uploads/users_template.xlsx")
xlsx.writeFile(wb,filePath)

res.download(filePath, "users_template.xlsx")
}

const importExcel = async(req,res)=>{
console.log("ImportExcel")
try{
const workbook = xlsx.readFile(req.file.path)
const sheetName = workbook.SheetNames[0]//Users
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName])

let inserted = 0
let updated = 0

// for of >>objects
// insertMany
//insert / update

for (const [key, value] of formData.entries()) {
  console.log("FormData:", key, value);
    const result = await User.updateOne(
        {email:row.email} ,//Match
        {$set:row}, //UPdate data
        {upsert:true} // insert if not exists
    )
    if(result.upsertedCount)
        inserted++;
    else updated++
}
res.json({
    message:"Excel processed",
    inserted,
    updated
})
}catch(e){
console.log(e)
}
}

//Student //
const downloadStudentTemplate=(req,res)=>{
    console.log("downloadStudentTemplate is calling..")
    const templateData = [
       {firstName:"", lastName:"",  username:"", email:"", password:"",phoneNumber:"",gender:"",birthdate:"", preferredCourses:[], } 
    ]
    const wb = xlsx.utils.book_new() // new excel sheet
    const ws = xlsx.utils.json_to_sheet(templateData) //json data to sheet >> template Data
    xlsx.utils.book_append_sheet(wb,ws,"Students")

    //store that location
    console.log(path.join(__dirname,"../uploads/students_template.xlsx"))
    const filePath = path.join(__dirname, "../uploads/students_template.xlsx")
    xlsx.writeFile(wb,filePath)
    res.download(filePath, "students_template.xlsx")
}

//add and update
const addUpdateStudentExcel = async (req, res) => {
  console.log("importStudentExcel is calling");

  try {
    if (!req.file?.path) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      raw: false,
      cellDates: true,
      defval: "",
    });

    let inserted = 0;
    let updated = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        const email = String(row.email || "").trim().toLowerCase();
        const username = String(row.username || "").trim();
        const rawPassword = String(row.password || "").trim();

        if (!email) {
          errors.push({ row: i + 2, key: "unknown", reason: "Missing email" });
          continue;
        }

        // 1) Find existing user
        const existingUser = await User.findOne({ email }).select("_id").lean();

        // If new user, password required
        if (!existingUser && !rawPassword) {
          errors.push({ row: i + 2, key: email, reason: "Missing password for new user" });
          continue;
        }

        // 2) Build user update (do NOT overwrite with empty)
        const userSet = {
          email,
          role: "student",
        };

        if (username) userSet.username = username;
        if (row.phoneNumber || row.phone) userSet.phoneNumber = String(row.phoneNumber || row.phone).trim();
        if (row.gender) userSet.gender = String(row.gender).trim();
        if (row.birthdate || row.dob) userSet.birthdate = row.birthdate || row.dob;

        // Only hash if password provided
        if (rawPassword) {
          userSet.password = await bcrypt.hash(rawPassword, 10);
        }

        // 3) Upsert user (returns DOC because rawResult is not set)
        const userDoc = await User.findOneAndUpdate(
          { email },
          { $set: userSet },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        if (!userDoc?._id) {
          throw new Error("User upsert failed (no _id returned)");
        }

        const userId = userDoc._id;

        // 4) preferredCourses parsing
        // Your template uses [] which Excel will often store as "[]" text
        // So handle:
        // - "HTML, CSS"
        // - "['HTML','CSS']"
        // - "[]"
        const preferredRaw = String(row.preferredCourses || "").trim();

        let preferredCourses = [];
        if (preferredRaw) {
          if (preferredRaw === "[]" ) {
            preferredCourses = [];
          } else if (preferredRaw.startsWith("[") && preferredRaw.endsWith("]")) {
            // try JSON parse if it's valid JSON like ["HTML","CSS"]
            try {
              const parsed = JSON.parse(preferredRaw.replace(/'/g, '"'));
              preferredCourses = Array.isArray(parsed) ? parsed.map(String).map(s => s.trim()).filter(Boolean) : [];
            } catch {
              preferredCourses = preferredRaw
                .replace(/^\[|\]$/g, "")
                .split(",")
                .map((c) => c.replace(/["']/g, "").trim())
                .filter(Boolean);
            }
          } else {
            preferredCourses = preferredRaw
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean);
          }
        }

        // 5) Check existing student (for correct counts)
        const existingStudent = await Student.findOne({
          $or: [{ userId }, { email }],
        })
          .select("_id")
          .lean();

        // 6) Upsert student (NO password)
        const studentSet = {
          userId,
          email,
          username,
          firstName: String(row.firstName || "").trim(),
          lastName: String(row.lastName || "").trim(),
          phoneNumber: String(row.phoneNumber || row.phone || "").trim(),
          gender: String(row.gender || "").trim(),
          birthdate: row.birthdate || row.dob || "",
          preferredCourses,
        };

        await Student.findOneAndUpdate(
          { $or: [{ userId }, { email }] },
          { $set: studentSet },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        if (!existingStudent) inserted++;
        else updated++;
      } catch (rowError) {
        console.error(`Error on row ${i + 2} (${row.email || "unknown"}):`, rowError);
        errors.push({
          row: i + 2,
          key: row.email || "unknown",
          reason: rowError?.message || "Unknown error",
        });
      }
    }

    return res.json({
      message: "Excel processed",
      inserted,
      updated,
      failed: errors.length,
      errors,
    });
  } catch (e) {
    console.error("Fatal error in importStudentExcel:", e);
    return res.status(500).json({ message: "Internal server error", error: e.message });
  }
};

//delete
const bulkDisableStudentsExcel = async (req, res) => {
  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

  let disabled = 0;
  let notFound = 0;
  const errors = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      const email = String(row.email || "").trim().toLowerCase();
      if (!email) {
        errors.push({ row: i + 2, key: "unknown", reason: "Missing email" });
        continue;
      }

      const user = await User.findOne({ email }).select("_id role isActive");
      if (!user) {
        notFound++;
        continue;
      }

      if (user.role !== "student") {
        errors.push({ row: i + 2, key: email, reason: `Refused: role is '${user.role}'` });
        continue;
      }

      if (user.isActive === false) {
        // already disabled - count or skip (your choice)
        continue;
      }

      await User.updateOne(
        { _id: user._id },
        { $set: { isActive: false, disabledAt: new Date(), disabledBy: req.user?._id || null } }
      );

      // optional: mark student too
      // await Student.updateOne({ userId: user._id }, { $set: { status: "inactive" } });

      disabled++;
    } catch (e) {
      errors.push({ row: i + 2, key: row.email || "unknown", reason: e.message });
    }
  }

  res.json({ message: "Disable processed", disabled, notFound, failed: errors.length, errors });
};


//Admission//
const downloadAdmissionTemplate=(req,res)=>{
    console.log("downloadAdmissionTemplate is calling..")
    const templateData = [
       {studentId:"", studentName:"", courseId:"", courseName:"", admissionSource:"", admissionFee:"",admissionDate:"",  courseName:"",batchNumber:"", } 
    ]
    const wb = xlsx.utils.book_new() // new excel sheet
    const ws = xlsx.utils.json_to_sheet(templateData) //json data to sheet >> template Data

    xlsx.utils.book_append_sheet(wb,ws,"Admissions")

    //store that location
    console.log(path.join(__dirname,"../uploads/admissions_template.xlsx"))
    const filePath = path.join(__dirname, "../uploads/admissions_template.xlsx")
    xlsx.writeFile(wb,filePath)
    res.download(filePath, "admissions_template.xlsx")
}
//Add & update admission
const importAdmissionExcel = async(req,res)=>{
    console.log("import  from admissionBulkloadController is calling")
    try{
        console.log("importStudentExcel:",req.file)
        const workbook = xlsx.readFile(req.file.path)
        const sheetName = workbook.SheetNames[0] //Admissions
             const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        raw: false,      // gives formatted text for some cells
        cellDates: true, // parse date cells as Date where possible
        });        
            console.log("First row keys:", Object.keys(data?.[0] || {}));
console.log("First row:", data?.[0]);

        let inserted = 0
        let updated = 0

        for (const row of data )
        {
            const result = await Admission.updateOne(
                {studentName:row.studentName}, // Match
                {$set:row}, // update data
                {upsert:true} // insert if not exists
            )
            if(result.upsertedCount)
                inserted ++;
            else updated++;
        }
        res.json({
            message:"Excel processed",
            inserted,
            updated
        })
        }catch(e){
        console.error("Some internal error",e)
    }
}

//edit
//delete

module.exports={downloadTemplate,importExcel,downloadStudentTemplate, addUpdateStudentExcel,downloadAdmissionTemplate, importAdmissionExcel, bulkDisableStudentsExcel }