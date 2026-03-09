const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    courseName: String,
    admissionFee: Number,
    batchNumber: { type: String, default: null },
    preferredCourses: { type: [String], default: [] },
    status: { type: String, default: "Not Assigned" },

    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    admissionDate: Date,
    admissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Admission" },
  },
  { timestamps: true }
);


studentSchema.pre("save", function (next) {
  if (!this.displayName) {
    this.displayName = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});

// studentSchema.methods.generateAuthToken = async function () {
//   return jwt.sign({ _id: this.id }, process.env.JWT_SECRET_KEY);
// };

studentSchema.virtual("admissionRel", {
  ref: "Admission",
  localField: "_id",
  foreignField: "studentId",
});

module.exports = mongoose.model("Student", studentSchema);
