const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const studentSchema = new mongoose.Schema(
  {
   //This student belongs to exactly one User, and every User can have at most one Student 
    userId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    displayName: { type: String, trim: true },

    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // password: { type: String, required: true },

    phoneNumber: { type: String, required: false, sparse: true }, // consider NOT unique
    gender: { type: String, default: "Rather not say" },
    birthdate: { type: Date },

    courseName: { type: String },
    admissionFee: { type: Number },
    batchNumber: { type: String, default: null },
    preferredCourses: { type: [String] },
    status: { type: String, default: "Not Assigned" },

    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    admissionDate: { type: Date },
    admissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Admission" },
  },
  { timestamps: true }
);

//  indexes (no studentName!)
studentSchema.index({ username: 1 }, { unique: true });
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ phoneNumber: 1 }, { sparse: true }); // only if you query by phone a lot

studentSchema.pre("save", function (next) {
  if (!this.displayName) {
    this.displayName = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});

studentSchema.methods.generateAuthToken = async function () {
  return jwt.sign({ _id: this.id }, process.env.JWT_SECRET_KEY);
};

studentSchema.virtual("admissionRel", {
  ref: "Admission",
  localField: "_id",
  foreignField: "studentId",
});

module.exports = mongoose.model("Student", studentSchema);
