const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    courseName: { type: String, required: true },
    studentName: { type: String, required: true },
    admissionSource: { type: String, required: true },
    admissionFee: { type: Number, required: true },
    admissionDate: { type: Date, required: true },
    admissionYear: { type: Number },
    admissionMonth: { type: String },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

batchNumber: { type: String, required: true },
    status: { type: String, default: "Assigned" },
  },
  { timestamps: true }
);

// prevent duplicate student+batch
admissionSchema.index({ studentId: 1, batchNumber: 1 }, { unique: true });

//  speed up lookups by student
admissionSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model("Admission", admissionSchema);
