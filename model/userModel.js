const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    googleId: { type: String, trim: true },
   title: {
  type: String,
  enum: ["", "Mr", "Ms", "Mrs", "Mx", "Dr", "Prof"],
  default: "",
},
    //  structured name
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
    //  keep for display + backward compatibility
    name: { type: String, trim: true }, 
    email: {
      type: String,
      required: true,
      unique: true,        
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: false },

    phoneNumber: { type: String, required: false, trim: true },
    country: { type: String, trim: true, uppercase: true }, 
    gender: { type: String, default: "Rather not say" },
    birthdate: { type: Date, required: false }, //only student now
    isActive: { type: Boolean, default: true, index: true },
    disabledAt: { type: Date, default: null },
    disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    role: {
      type: String,
      enum: [
        "admin",
        "user",
        "manager",
        "supportTeam",
        "testingTeam",
        "guest",
        "student",
        "staff",
      ],
      required: false,
      default: "user", 
    },
  },{ timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.name) {
    const firstN = (this.firstName || "").trim();
    const lastN = (this.lastName || "").trim();
    const full = `${firstN} ${lastN}`.trim();
    if (full) this.name = full;
  }
  next();
});
userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.generateAuthToken = async function () {
  return jwt.sign(
    { _id: this.id, role: this.role },
    process.env.JWT_SECRET_KEY
  );
};

userSchema.virtual("studentRel", {
  ref: "Student",
  localField: "_id",
  foreignField: "userId",
    justOne: true,
});

module.exports = mongoose.model("User", userSchema);
